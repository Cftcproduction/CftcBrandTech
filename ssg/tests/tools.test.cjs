const { test } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/pagespeed');
test('calculator reference values and boundaries', async () => {
  const { calculate: c } = await import('../../js/tool-calculations.mjs');
  assert.deepEqual(c('roas', { spend: 10000, revenue: 50000 }), { roas: 5, percent: 500 });
  assert.equal(c('roas', { spend: 10, revenue: 0 }).roas, 0);
  assert.throws(() => c('roas', { spend: 0, revenue: 100 }));
  assert.throws(() => c('roas', { spend: 10, revenue: -1 }));
  const budget = c('google-ads-butce', { mode: 'sales', conversions: 100, cpc: 10, rate: 2, days: 30, basket: 1000 });
  assert.equal(budget.budget, 50000); assert.equal(budget.clicks, 5000); assert.equal(budget.roas, 2);
  assert.equal(c('google-ads-butce', { mode: 'leads', conversions: 1, cpc: 1.5, rate: 100, days: 1 }).budget, 1.5);
  assert.throws(() => c('google-ads-butce', { mode: 'leads', conversions: 1, cpc: 1, rate: 101, days: 1 }));
  assert.deepEqual(c('meta-ads-cpl-cpa', { spend: 10000, leads: 100, customers: 0 }), { cpl: 100, cpa: null });
  const input = { current: 100000, target: 200000, months: 6, basket: 1000, rate: 2, roas: 5 };
  const growth = c('buyume-hedefi', input); assert.equal(growth.growth, 100); assert.equal(growth.rows.at(-1).revenue, 200000); assert.equal(growth.rows.at(-1).traffic, 10000);
  assert.throws(() => c('buyume-hedefi', { ...input, current: 0 }));
  assert.equal(c('buyume-hedefi', { ...input, target: 100000 }).monthly, 0);
  assert.ok(c('buyume-hedefi', { ...input, target: 50000 }).monthly < 0);
});
test('Turkish number input separators', async () => {
  const { parseTurkishNumber: parse } = await import('../../js/tool-calculations.mjs');
  assert.equal(parse('10.000,50'), 10000.5);
  assert.equal(parse('1.234.567,89'), 1234567.89);
  assert.equal(parse('0,25'), .25);
  assert.equal(parse('10000'), 10000);
  for (const value of ['', '10.50', '1,2,3', 'abc', '1e3']) assert.ok(Number.isNaN(parse(value)));
});
test('profit, ecommerce and assessment calculations', async () => {
  const { calculate: c } = await import('../../js/tool-calculations.mjs');
  const ad = c('reklam-karlilik', { spend: 10000, revenue: 24000, customers: 20, margin: 100 / 3 });
  assert.equal(ad.roas, 2.4); assert.equal(ad.cpa, 500); assert.equal(ad.breakEven, 3); assert.ok(Math.abs(ad.contribution + 2000) < .000001);
  assert.equal(c('reklam-karlilik', { spend: 100, revenue: 0, customers: 0, margin: 50 }).cpa, null);
  assert.throws(() => c('reklam-karlilik', { spend: 100, revenue: 200, customers: 1, margin: 0 }));
  const input = { price: 1000, cost: 400, commission: 15, shipping: 70, adCost: 100, returns: 30 };
  const profit = c('eticaret-kar', input); assert.equal(profit.total, 750); assert.equal(profit.contribution, 250); assert.equal(profit.margin, 25); assert.equal(profit.maxAdCost, 350);
  assert.ok(c('eticaret-kar', { ...input, cost: 1200 }).maxAdCost < 0);
  assert.throws(() => c('eticaret-kar', { ...input, price: 0 }));
  const assessment = { current: 100000, target: 200000, budget: 10000, website: 'yes', analytics: true, seo: false, ads: true, crm: false, sector: 'B2B' };
  const plan = c('buyume-firsatlari', assessment); assert.equal(plan.score, 60); assert.equal(plan.growth, 100); assert.equal(plan.budgetRatio, 10); assert.equal(plan.priorities.length, 2);
  assert.equal(c('buyume-firsatlari', { ...assessment, seo: true, crm: true }).score, 100);
});
function request(query) { return { method: 'GET', query, headers: {}, socket: { remoteAddress: Math.random().toString() } }; }
function response() { return { statusCode: 200, setHeader() {}, status(value) { this.statusCode = value; return this; }, json(value) { this.body = value; return this; } }; }
test('PageSpeed validation, errors, normalization and rate limit', async () => {
  const originalFetch = global.fetch, originalKey = process.env.PAGESPEED_API_KEY;
  const query = { url: 'https://www.cftcbrandtech.com', strategy: 'mobile' };
  try {
    for (const url of ['file:///tmp/a', 'http://localhost', 'http://127.0.0.1', 'http://[::1]', 'https://a:b@site.com', 'https://site.com:3000']) assert.equal(handler.validUrl(url), null);
    let res = response(); await handler(request({ ...query, url: 'invalid' }), res); assert.equal(res.statusCode, 400);
    delete process.env.PAGESPEED_API_KEY;
    res = response(); await handler(request(query), res); assert.equal(res.statusCode, 503);
    process.env.PAGESPEED_API_KEY = 'test-placeholder';
    global.fetch = async url => { assert.equal(url.hostname, 'www.googleapis.com'); return { ok: true, json: async () => ({ lighthouseResult: { categories: { performance: { score: .93 } } } }) }; };
    res = response(); await handler(request(query), res); assert.equal(res.statusCode, 200); assert.equal(res.body.score, 93); assert.equal(res.body.metrics[0].value, null);
    global.fetch = async () => ({ ok: false, status: 429 });
    res = response(); await handler(request(query), res); assert.equal(res.statusCode, 429);
    global.fetch = async () => { throw Object.assign(new Error('timeout'), { name: 'AbortError' }); };
    res = response(); await handler(request(query), res); assert.equal(res.statusCode, 504);
    global.fetch = async () => ({ ok: true, json: async () => ({}) });
    res = response(); await handler(request(query), res); assert.equal(res.statusCode, 502);
    global.fetch = async () => ({ ok: false, status: 500 });
    const req = request(query);
    for (let i = 0; i < 4; i++) { res = response(); await handler(req, res); }
    assert.equal(res.statusCode, 429);
  } finally { global.fetch = originalFetch; if (originalKey === undefined) delete process.env.PAGESPEED_API_KEY; else process.env.PAGESPEED_API_KEY = originalKey; }
});
