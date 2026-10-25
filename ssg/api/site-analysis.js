const { validUrl } = require('./pagespeed');
const { fetchHtml, inspect } = require('../lib/site-analysis.cjs');
const limits = new Map();
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const fail = (code, error) => res.status(code).json({ error });
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return fail(405, 'Bu işlem desteklenmiyor.'); }
  const { url, competitor, keyword = '', mode } = req.query;
  if (!validUrl(url) || !['conversion', 'competitor'].includes(mode) || mode === 'competitor' && (!validUrl(competitor) || typeof keyword !== 'string' || !keyword.trim() || keyword.length > 100)) return fail(400, 'Geçerli adresleri ve en fazla 100 karakterlik hedef kelimeyi girin.');
  const now = Date.now(); for (const [key, bucket] of limits) if (bucket.until <= now) limits.delete(key);
  const ip = String(req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown');
  const bucket = limits.get(ip) || { count: 0, until: now + 60000 };
  if (bucket.count >= 3 || limits.size >= 10000 && !limits.has(ip)) { res.setHeader('Retry-After', '60'); return fail(429, 'Bir dakika içinde en fazla üç analiz yapabilirsiniz.'); }
  bucket.count++; limits.set(ip, bucket);
  const scan = async value => { try { const page = await fetchHtml(value); return { ok: true, ...inspect(page.html, page.url, keyword.trim()) }; } catch { return { ok: false, url: value, error: 'Sayfa okunamadı. Adresi ve herkese açık erişimi kontrol edin; erişim engeli, zaman aşımı veya desteklenmeyen içerik olabilir.' }; } };
  const pages = await Promise.all((mode === 'competitor' ? [url, competitor] : [url]).map(scan));
  return res.status(pages.some(p => p.ok) ? 200 : 502).json({ pages, error: pages.every(p => !p.ok) ? 'Sayfalara erişilemedi. Lütfen adresleri kontrol edin.' : undefined });
};
