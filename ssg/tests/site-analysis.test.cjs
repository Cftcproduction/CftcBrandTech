const { test } = require('node:test');
const assert = require('node:assert/strict');
const { inspect, publicIPv4, fetchHtml } = require('../lib/site-analysis.cjs');
test('HTML signals and keyword checks use observable content', () => {
  const html = `<html><head><title>Örnek ürün</title><meta content='Ürün açıklaması' name='description'><meta name=viewport content=width=device-width><link href="https://site.com/" rel="canonical"></head><body><h1>Ürün al</h1><a href=/contact>Teklif al</a><a href=/kvkk>KVKK</a><img src=a><img alt='Ürün' src=b><form></form><script>"<form><h1>fake</h1>"</script><!-- <form></form> --></body></html>`;
  const p = inspect(html, 'https://site.com/', 'ürün');
  assert.equal(p.h1Count, 1); assert.equal(p.forms, 1); assert.equal(p.ctas, 1); assert.equal(p.missingAlt, 1); assert.equal(p.privacy, true); assert.equal(p.viewport, true);
  assert.equal(p.canonical, 'https://site.com/'); assert.deepEqual(p.keyword, { title: true, description: true, h1: true, content: true });
  const empty = inspect('<head><title>kelime</title></head><body><img data-alt="x"><meta data-name="viewport"></body>', 'http://site.com/', 'kelime');
  assert.equal(empty.keyword.content, false); assert.equal(empty.viewport, false); assert.equal(empty.missingAlt, 1); assert.equal(empty.https, false);
});
test('private and reserved network destinations are blocked', async () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.0.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '198.18.0.1', '203.0.113.1']) assert.equal(publicIPv4(ip), false, ip);
  assert.equal(publicIPv4('8.8.8.8'), true);
  for (const url of ['file:///etc/passwd', 'http://127.0.0.1', 'http://[::1]', 'https://user:password@site.com']) await assert.rejects(fetchHtml(url));
});
test('site API rejects invalid inputs without fetching', async () => {
  const handler = require('../api/site-analysis');
  const res = { setHeader() {}, status(c) { this.code = c; return this; }, json(v) { this.body = v; } };
  await handler({ method: 'GET', query: { url: 'http://localhost', mode: 'conversion' } }, res); assert.equal(res.code, 400);
  await handler({ method: 'GET', query: { url: 'https://site.com', competitor: 'https://other.com', mode: 'competitor', keyword: '' } }, res); assert.equal(res.code, 400);
});
test('DNS address pinning and redirect checks prevent internal requests', async () => {
  const dns = require('node:dns/promises'), https = require('node:https');
  const { EventEmitter } = require('node:events');
  const originalLookup = dns.lookup, originalGet = https.get;
  let connections = 0, redirect = false;
  try {
    dns.lookup = async () => [{ address: '10.0.0.1', family: 4 }];
    https.get = () => { connections++; throw new Error('should not connect'); };
    await assert.rejects(fetchHtml('https://site.com/')); assert.equal(connections, 0);
    dns.lookup = async () => [{ address: '8.8.8.8', family: 4 }];
    https.get = (_url, options, callback) => {
      connections++;
      options.lookup('site.com', { all: true }, (error, result) => { assert.equal(error, null); assert.deepEqual(result, [{ address: '8.8.8.8', family: 4 }]); });
      const request = new EventEmitter(); request.destroy = error => request.emit('error', error);
      process.nextTick(() => {
        const response = new EventEmitter(); response.statusCode = redirect ? 302 : 200; response.headers = redirect ? { location: 'http://127.0.0.1/private' } : { 'content-type': 'text/html' }; response.resume = () => {}; response.destroy = () => {};
        callback(response);
        if (!redirect) { response.emit('data', Buffer.from('<h1>Test</h1>')); response.emit('end'); }
        request.emit('close');
      });
      return request;
    };
    assert.equal((await fetchHtml('https://site.com/')).html, '<h1>Test</h1>');
    redirect = true; const before = connections; await assert.rejects(fetchHtml('https://site.com/')); assert.equal(connections, before + 1);
  } finally { dns.lookup = originalLookup; https.get = originalGet; }
});
