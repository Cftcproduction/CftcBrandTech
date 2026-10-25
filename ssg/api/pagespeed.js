const { isIP } = require('node:net');
const limits = new Map();
function validUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    // Only public domain names; Google performs the analysis, never this server.
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || isIP(host) || host.includes(':') || !host.includes('.') || /(^|\.)(localhost|local|internal|test|invalid|example)$/.test(host) || /^\d[\d.]*$/.test(host)) return null;
    url.hash = ''; return url.href;
  } catch { return null; }
}
function summarize(data) {
  const result = data.lighthouseResult;
  if (!result || result.runtimeError) throw new Error('Rapor üretilemedi');
  const audits = result.audits || {};
  const score = result.categories?.performance?.score;
  return {
    url: result.finalDisplayedUrl || result.finalUrl || result.requestedUrl || '',
    score: typeof score === 'number' && Number.isFinite(score) ? Math.round(score * 100) : null,
    metrics: [['largest-contentful-paint', 'LCP'], ['cumulative-layout-shift', 'CLS'], ['first-contentful-paint', 'FCP'], ['total-blocking-time', 'TBT'], ['speed-index', 'Speed Index']].map(([id, label]) => ({ label, value: typeof audits[id]?.displayValue === 'string' ? audits[id].displayValue : null })),
    improvements: (result.categories?.performance?.auditRefs || []).map(ref => audits[ref.id]).filter(a => a && typeof a.score === 'number' && a.score < 0.9 && !['largest-contentful-paint', 'cumulative-layout-shift', 'first-contentful-paint', 'total-blocking-time', 'speed-index', 'interactive'].includes(a.id) && typeof a.title === 'string').sort((a, b) => a.score - b.score).slice(0, 6).map(a => ({ title: a.title, value: typeof a.displayValue === 'string' ? a.displayValue : '' })),
  };
}
async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const fail = (status, error) => res.status(status).json({ error });
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return fail(405, 'Bu işlem desteklenmiyor.'); }
  const url = validUrl(req.query.url), strategy = req.query.strategy;
  if (!url || !['mobile', 'desktop'].includes(strategy)) return fail(400, 'Geçerli bir herkese açık HTTP/HTTPS adresi ve cihaz seçin.');
  if (!process.env.PAGESPEED_API_KEY) return fail(503, 'Hız analizi servisi henüz yapılandırılmadı. Lütfen daha sonra deneyin.');
  const now = Date.now();
  for (const [key, value] of limits) if (value.until <= now) limits.delete(key);
  const ip = String(req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown');
  const bucket = limits.get(ip) || { count: 0, until: now + 60000 };
  if (bucket.count >= 3 || limits.size >= 10000 && !limits.has(ip)) { res.setHeader('Retry-After', '60'); return fail(429, 'Çok fazla analiz istendi. Bir dakika sonra yeniden deneyin.'); }
  bucket.count++; limits.set(ip, bucket);
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  for (const [key, value] of Object.entries({ url, strategy, category: 'performance', locale: 'tr', key: process.env.PAGESPEED_API_KEY })) endpoint.searchParams.set(key, value);
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 55000);
  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    if (response.status === 429 || response.status === 403) return fail(429, 'Google analiz kotasına ulaşıldı veya servis erişimi kısıtlı. Daha sonra yeniden deneyin.');
    if (!response.ok) return fail(502, 'Google bu adresi analiz edemedi. Adresi kontrol edip yeniden deneyin.');
    const report = summarize(await response.json());
    return res.status(200).json(report);
  } catch (error) { return fail(error.name === 'AbortError' ? 504 : 502, error.name === 'AbortError' ? 'Analiz zaman aşımına uğradı. Yeniden deneyin.' : 'Analiz servisine ulaşılamadı. Daha sonra yeniden deneyin.'); }
  finally { clearTimeout(timer); }
}
module.exports = handler;
module.exports.validUrl = validUrl;
module.exports.summarize = summarize;
