const http = require('node:http');
const https = require('node:https');
const dns = require('node:dns/promises');
const { validUrl } = require('../api/pagespeed');
function publicIPv4(ip) {
  const p = ip.split('.').map(Number);
  return p.length === 4 && p.every(n => Number.isInteger(n) && n >= 0 && n <= 255) && ![0, 10, 127].includes(p[0]) && p[0] < 224 && !(p[0] === 169 && p[1] === 254) && !(p[0] === 172 && p[1] >= 16 && p[1] <= 31) && !(p[0] === 192 && [0, 168].includes(p[1])) && !(p[0] === 100 && p[1] >= 64 && p[1] <= 127) && !(p[0] === 198 && [18, 19, 51].includes(p[1])) && !(p[0] === 203 && p[1] === 0);
}
async function fetchHtml(value, redirects = 0, deadline = Date.now() + 15000) {
  const normalized = validUrl(value); if (!normalized || redirects > 3 || Date.now() >= deadline) throw new Error('Adres okunamadı.');
  const url = new URL(normalized);
  const addresses = await Promise.race([dns.lookup(url.hostname, { all: true, family: 4 }).then(records => records.map(r => r.address)), new Promise((_, reject) => { const t = setTimeout(() => reject(new Error('DNS zaman aşımı.')), Math.max(1, deadline - Date.now())); t.unref(); })]);
  if (!addresses.length || !addresses.every(publicIPv4)) throw new Error('Bu ağ adresi analiz edilemez.');
  // Pin the validated address for the connection; validate every redirect again.
  return new Promise((resolve, reject) => {
    const req = (url.protocol === 'https:' ? https : http).get(url, { headers: { 'User-Agent': 'CFTC-Site-Preview/1.0', Accept: 'text/html', 'Accept-Encoding': 'identity' }, lookup: (_host, options, callback) => options.all ? callback(null, [{ address: addresses[0], family: 4 }]) : callback(null, addresses[0], 4) }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) { res.resume(); if (!res.headers.location) return reject(new Error('Yönlendirme adresi yok.')); fetchHtml(new URL(res.headers.location, url).href, redirects + 1, deadline).then(resolve, reject); return; }
      if (res.statusCode !== 200 || !/text\/html|application\/xhtml\+xml/i.test(res.headers['content-type'] || '')) { res.resume(); return reject(new Error('Sayfanın HTML içeriğine erişilemiyor.')); }
      let size = 0; const chunks = [];
      res.on('data', chunk => { size += chunk.length; if (size > 2 * 1024 * 1024) { res.destroy(); reject(new Error('Sayfa analiz boyutu sınırını aşıyor.')); } else chunks.push(chunk); });
      res.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8'), url: url.href })); res.on('error', reject);
    });
    const timer = setTimeout(() => req.destroy(new Error('Sayfa okuma zaman aşımı.')), Math.max(1, deadline - Date.now()));
    req.on('close', () => clearTimeout(timer)); req.on('error', reject);
  });
}
function text(html) { return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim(); }
function attr(tag, name) { return tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))?.slice(1).find(v => v !== undefined) || ''; }
function inspect(html, url, keyword = '') {
  // Bounded static HTML checks, never execute third-party markup or scripts.
  html = html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  const title = text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').slice(0, 300);
  const metas = html.match(/<meta\b[^>]*>/gi) || [], links = html.match(/<link\b[^>]*>/gi) || [];
  const description = attr(metas.find(t => attr(t, 'name').toLowerCase() === 'description') || '', 'content').slice(0, 500);
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => text(m[1]));
  const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(m => ({ href: attr(m[1], 'href'), label: text(m[2]) }));
  const images = html.match(/<img\b[^>]*>/gi) || [];
  const visible = text(html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, ' ')), normalize = s => s.toLocaleLowerCase('tr-TR');
  const hasKeyword = s => Boolean(keyword && normalize(s).includes(normalize(keyword)));
  return { url, title, description, h1Count: h1s.length, h1: h1s.slice(0, 3).map(s => s.slice(0, 200)), canonical: attr(links.find(t => attr(t, 'rel').split(/\s+/).includes('canonical')) || '', 'href').slice(0, 2048), https: url.startsWith('https:'), viewport: metas.some(t => attr(t, 'name').toLowerCase() === 'viewport'), images: images.length, missingAlt: images.filter(t => !attr(t, 'alt').trim()).length, forms: (html.match(/<form\b/gi) || []).length, ctas: anchors.filter(a => /satın al|teklif|iletişim|randevu|başvur|sepete|buy|contact|quote|book/i.test(a.label)).length + [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)].filter(m => /satın al|teklif|iletişim|randevu|başvur|sepete|buy|contact|quote|book/i.test(text(m[1]))).length, privacy: anchors.some(a => /kvkk|gizlilik|privacy/i.test(a.label + ' ' + a.href)), keyword: { title: hasKeyword(title), description: hasKeyword(description), h1: h1s.some(hasKeyword), content: hasKeyword(visible) } };
}
module.exports = { publicIPv4, fetchHtml, inspect };
