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
