import { calculate, parseTurkishNumber } from './tool-calculations.mjs';
const number = value => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(value);
const money = value => `${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} TL`;
const results = document.querySelector('#results');
const form = document.querySelector('#tool-form');
const status = document.querySelector('#form-status');
const tool = document.body.dataset.tool;
const remoteTools = ['web-hiz-analizi', 'donusum-analizi', 'rakip-seo'];
const offers = {
  'reklam-karlilik': ['Reklamlarınızı birlikte değerlendirelim.', 'Reklam performansı için ön değerlendirme talep edin.'],
  'donusum-analizi': ['Web sitenizdeki dönüşüm fırsatlarını birlikte inceleyelim.', 'Detaylı CRO incelemesi talep edin.'],
  'rakip-seo': ['SEO fırsatlarınızı bir yol haritasına dönüştürelim.', 'Siteniz için SEO yol haritası talep edin.'],
  'eticaret-kar': ['Satışlarınızın katkısını birlikte iyileştirelim.', 'E-ticaret maliyet analizi talep edin.'],
  'buyume-firsatlari': ['İşletmeniz için sonraki adımı birlikte planlayalım.', 'İşletmenize özel 90 günlük büyüme yol haritası için görüşme planlayın.'],
};
function offer() {
  const content = offers[tool]; if (!content) return;
  const box = element('aside', null, 'result-offer');
  const link = element('a', 'Ücretsiz ön değerlendirme talep et ↗', 'offer-link'); link.href = '/contact/'; link.dataset.noSwup = '';
  box.append(element('p', '03 — UZMAN DESTEĞİ', 'eyebrow'), element('h3', content[0]), element('p', content[1]), link); results.append(box);
}
function element(tag, text, className) { const node = document.createElement(tag); if (text != null) node.textContent = text; if (className) node.className = className; return node; }
function finiteResults(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  if (value && typeof value === 'object') return Object.values(value).every(finiteResults);
  return true;
}
function metrics(items) {
  const grid = element('div', null, 'result-grid');
  for (const [label, value] of items) { const card = element('div', null, 'metric'); card.append(element('span', label), element('strong', value)); grid.append(card); }
  results.append(grid);
}
function growthTable(rows) {
  const wrap = element('div', null, 'table-scroll'), table = element('table');
  table.append(element('caption', 'Aylara göre büyüme planı'));
  const head = element('thead'), header = element('tr');
  for (const title of ['Ay', 'Ciro', 'Sipariş', 'Oturum', 'Reklam bütçesi']) { const th = element('th', title); th.scope = 'col'; header.append(th); }
  head.append(header); const body = element('tbody');
  for (const row of rows) { const tr = element('tr'); for (const v of [row.month, money(row.revenue), number(row.orders), number(row.traffic), money(row.budget)]) tr.append(element('td', v)); body.append(tr); }
  table.append(head, body); wrap.append(table); results.append(wrap);
}
function renderCalculation(data) {
  results.replaceChildren();
  if (tool === 'roas') metrics([['ROAS', `${number(data.roas)}×`], ['ROAS yüzdesi', `%${number(data.percent)}`]]);
  if (tool === 'meta-ads-cpl-cpa') metrics([['Potansiyel müşteri maliyeti (CPL)', data.cpl == null ? 'Tanımsız (0 adet)' : money(data.cpl)], ['Müşteri edinimi maliyeti (CPA)', data.cpa == null ? 'Tanımsız (0 adet)' : money(data.cpa)]]);
  if (tool === 'google-ads-butce') metrics([['Gereken tıklama', number(data.clicks)], ['Toplam bütçe', money(data.budget)], ['Günlük ortalama bütçe', money(data.daily)], ...(data.revenue !== undefined ? [['Tahmini ciro', money(data.revenue)], ['Tahmini ROAS', `${number(data.roas)}×`]] : [])]);
  if (tool === 'buyume-hedefi') { const last = data.rows.at(-1); metrics([['Toplam büyüme', `%${number(data.growth)}`], ['Bileşik aylık büyüme', `%${number(data.monthly)}`], ['Hedef ay sipariş', number(last.orders)], ['Hedef ay oturum', number(last.traffic)], ['Hedef ay reklam bütçesi', money(last.budget)]]); growthTable(data.rows); }
  if (tool === 'reklam-karlilik') {
    metrics([['Gerçekleşen ROAS', `${number(data.roas)}×`], ['Başabaş ROAS', `${number(data.breakEven)}×`], ['Müşteri edinimi maliyeti', data.cpa === null ? 'Tanımsız (0 müşteri)' : money(data.cpa)], ['Başabaş için gereken ciro', money(data.breakEvenRevenue)], ['Reklam sonrası katkı', money(data.contribution)]]);
    results.append(element('p', data.contribution < -0.005 ? 'Reklam geliriniz, belirttiğiniz katkı marjına göre reklam harcamasını karşılamıyor.' : data.contribution > 0.005 ? 'Bu girdilerle reklam harcaması sonrası pozitif katkı oluşuyor. Sabit giderler ve vergiler ayrıca değerlendirilmelidir.' : 'Bu girdilerle reklam sonrası katkı başabaş düzeyinde.'));
  }
  if (tool === 'eticaret-kar') {
    metrics([['Toplam değişken gider', money(data.total)], ['Reklam sonrası katkı', money(data.contribution)], ['Katkı oranı', `%${number(data.margin)}`], ['Başabaş reklam gideri sınırı', money(data.maxAdCost)]]);
    const list = element('ul'); for (const [label, value] of data.costs) list.append(element('li', `${label}: ${money(value)}`)); results.append(list);
    results.append(element('p', data.maxAdCost < 0 ? 'Reklam gideri olmasa bile diğer değişken giderler satış gelirini aşıyor.' : data.contribution < 0 ? 'Bu ürün / sipariş, girdiğiniz giderlerle negatif katkı üretiyor.' : 'Bu girdilerle pozitif veya başabaş katkı oluşuyor. Sabit giderler ve vergiler dahil değildir.'));
  }
  if (tool === 'buyume-firsatlari') {
    metrics([['Altyapı öz değerlendirmesi', `${data.score} / 100`], ['Ciro hedefindeki değişim', `%${number(data.growth)}`], ['Bütçe / mevcut ciro', `%${number(data.budgetRatio)}`]]);
    results.append(element('p', `${data.sector} için başlangıç öncelikleri (beyanınıza dayalı):`));
    const priorities = element('ul'); for (const p of data.priorities) priorities.append(element('li', p)); results.append(priorities);
    results.append(element('h3', '90 günlük başlangıç yol haritası'));
    const roadmap = element('ol');
    for (const p of [`1–30. gün: ${data.priorities[0]} Mevcut dönüşüm ve maliyet verilerini kaydedin.`, '31–60. gün: Bir hedef kitle ve bir teklif ile küçük bir test yapın; sonuçları ölçün.', '61–90. gün: Testleri katkı, dönüşüm oranı ve müşteri edinimi maliyetiyle değerlendirin; bütçeyi sonuçlara göre planlayın.']) roadmap.append(element('li', p)); results.append(roadmap);
  }
  offer();
}
function comparison(pages) {
  const wrap = element('div', null, 'table-scroll'), table = element('table'), head = element('thead'), tr = element('tr');
  for (const label of ['Kontrol', 'Siteniz', 'Rakip sayfa']) { const th = element('th', label); th.scope = 'col'; tr.append(th); } head.append(tr); table.append(element('caption', 'Girilen sayfaların HTML ön incelemesi'), head);
  const body = element('tbody');
  const checks = [['Sayfa başlığı', p => p.title || 'Bulunamadı'], ['Meta açıklama', p => p.description || 'Bulunamadı'], ['H1 adedi', p => number(p.h1Count)], ['Canonical', p => p.canonical || 'Bulunamadı'], ['HTTPS', p => p.https ? 'Var' : 'Yok'], ['Viewport', p => p.viewport ? 'Var' : 'Bulunamadı'], ['Boş / eksik alt metni', p => `${number(p.missingAlt)} / ${number(p.images)}`], ...['title', 'description', 'h1', 'content'].map((key, i) => [['Başlıkta hedef kelime', 'Açıklamada hedef kelime', 'H1 içinde hedef kelime', 'İçerikte hedef kelime'][i], p => p.keyword[key] ? 'Bulundu' : 'Bulunamadı'])];
  for (const [label, get] of checks) { const row = element('tr'); const th = element('th', label); th.scope = 'row'; row.append(th); for (const p of pages) row.append(element('td', p.ok ? get(p) : 'Sayfa okunamadı')); body.append(row); }
  table.append(body); wrap.append(table); results.append(wrap);
  const own = pages[0], rival = pages[1];
  const gaps = [];
  if (own.ok && rival.ok) {
    if (!own.description && rival.description) gaps.push('Rakip sayfada açıklama var; kendi sayfanızın meta açıklamasını kontrol edin.');
    if (!own.title && rival.title) gaps.push('Kendi sayfanızın başlık etiketini ekleyin.');
    if (own.h1Count !== 1 && rival.h1Count === 1) gaps.push('Ana başlık yapınızı gözden geçirin; rakip sayfada tek H1 tespit edildi.');
    for (const [key, label] of [['title', 'başlık'], ['description', 'açıklama'], ['h1', 'H1']]) if (!own.keyword[key] && rival.keyword[key]) gaps.push(`Hedef kelime rakibin ${label} alanında bulundu; kendi sayfanızda doğal ve ilgili kullanımını değerlendirin.`);
  }
  results.append(element('h3', 'İncelenebilecek fırsatlar'));
  const list = element('ul'); for (const gap of gaps) list.append(element('li', gap)); results.append(gaps.length ? list : element('p', 'Bu kontrollerde doğrulanabilir bir rakip avantajı çıkarılamadı. Bu sonuç sıralamaların eşit olduğu anlamına gelmez.'));
}
async function analyzeSite(data, signal) {
  const query = new URLSearchParams({ url: data.url, mode: tool === 'rakip-seo' ? 'competitor' : 'conversion' });
  if (tool === 'rakip-seo') { query.set('competitor', data.competitor); query.set('keyword', data.keyword); }
  const read = async url => { const response = await fetch(url, { signal }); const report = await response.json(); if (!response.ok) throw new Error(report.error || 'Analiz tamamlanamadı.'); return report; };
  const [scan, speed] = await Promise.allSettled([read(`/api/site-analysis?${query}`), tool === 'donusum-analizi' ? read(`/api/pagespeed?${new URLSearchParams({ url: data.url, strategy: 'mobile' })}`) : Promise.resolve(null)]);
  if (scan.status === 'rejected' && (!speed.value || speed.status === 'rejected')) throw scan.reason;
  // Do not overwrite the screen with results for edited inputs.
  if (Object.entries(data).some(([key, value]) => form.elements[key]?.value !== value)) { results.replaceChildren(element('p', 'Girdiler değişti. Güncel değerlerle analizi yeniden başlatın.')); return; }
  results.replaceChildren();
  if (scan.status === 'fulfilled') {
    for (const p of scan.value.pages) results.append(element('p', `${p.url}${p.ok ? '' : ` — ${p.error}`}`));
    if (tool === 'rakip-seo') comparison(scan.value.pages);
    else {
      const p = scan.value.pages[0];
      if (p.ok) {
        metrics([['CTA metni eşleşmeleri', number(p.ctas)], ['HTML form adedi', number(p.forms)], ['Viewport etiketi', p.viewport ? 'Var' : 'Bulunamadı'], ['Gizlilik / KVKK bağlantısı', p.privacy ? 'Bulundu' : 'Bulunamadı'], ['HTTPS', p.https ? 'Var' : 'Yok']]);
        const list = element('ul'); for (const message of [!p.ctas && 'HTML içinde tanınan bir CTA metni bulunamadı; teklif ve eylem bağlantılarınızı gözden geçirin.', !p.forms && 'HTML içinde form bulunamadı; iletişim veya satın alma akışını elle inceleyin.', !p.privacy && 'Gizlilik / KVKK bağlantısı tespit edilmedi; güven ve bilgilendirme alanlarını kontrol edin.', !p.viewport && 'Mobil viewport etiketi bulunamadı; mobil görünümü kontrol edin.'].filter(Boolean)) list.append(element('li', message)); results.append(list);
      }
    }
  } else results.append(element('p', 'HTML ön incelemesi tamamlanamadı. Mobil hız sonucu aşağıdadır.'));
  if (tool === 'donusum-analizi') {
    if (speed.status === 'fulfilled') { metrics([['Mobil laboratuvar performansı', speed.value.score == null ? 'Veri yok' : `${speed.value.score} / 100`], ...speed.value.metrics.map(m => [m.label, m.value || 'Veri yok'])]); }
    else results.append(element('p', 'Mobil hız raporu alınamadı. HTML bulguları tek başına hız veya dönüşüm performansını göstermez.'));
    results.append(element('p', 'Formun çalışması, ödeme adımları, güven unsurlarının doğruluğu ve gerçek kullanıcı deneyimi otomatik olarak doğrulanmadı.'));
  }
  offer();
}
function modeChanged() {
  if (tool !== 'google-ads-butce') return;
  const hidden = form.elements.mode.value === 'leads';
  document.querySelector('#basket-field').hidden = hidden;
  form.elements.basket.disabled = hidden;
}
form?.addEventListener('input', () => { modeChanged(); results.replaceChildren(element('p', 'Veriler değişti. Güncel sonuçlar için yeniden hesaplayın.')); status.textContent = ''; });
form?.querySelectorAll('[data-numeric]').forEach(input => {
  input.addEventListener('input', () => input.setCustomValidity(''));
  input.addEventListener('blur', () => {
    const value = parseTurkishNumber(input.value);
    if (Number.isFinite(value)) input.value = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 12 }).format(value);
  });
});
modeChanged();
let busy = false;
form?.addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  let firstInvalid;
  form.querySelectorAll('input').forEach(input => {
    if (input.hasAttribute('data-numeric')) {
      const value = parseTurkishNumber(input.value);
      const min = Number(input.dataset.min), max = input.dataset.max === '' ? Infinity : Number(input.dataset.max);
      input.setCustomValidity(!Number.isFinite(value) ? 'Geçerli bir sayı girin (örnek: 10.000,50).' : value < min || value > max ? `Değer en az ${number(min)}${Number.isFinite(max) ? `, en fazla ${number(max)}` : ''} olmalıdır.` : input.dataset.integer === 'true' && !Number.isInteger(value) ? 'Tam sayı girin.' : '');
    }
    const invalid = !input.disabled && !input.validity.valid;
    input.setAttribute('aria-invalid', String(invalid));
    const error = form.querySelector(`[data-error="${input.name}"]`);
    if (error) { error.id = `error-${input.name}`; input.setAttribute('aria-describedby', error.id); error.textContent = invalid ? input.validationMessage : ''; }
    if (invalid && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) { results.replaceChildren(element('p', 'Sonuç için işaretli alanları düzeltin.')); firstInvalid.focus(); return; }
  const data = Object.fromEntries(new FormData(form));
  for (const key of Object.keys(data)) if (form.elements[key]?.hasAttribute('data-numeric')) data[key] = parseTurkishNumber(data[key]);
  if (tool === 'buyume-firsatlari') for (const key of ['analytics', 'seo', 'ads', 'crm']) data[key] = form.elements[key].checked;
  status.textContent = '';
  if (!remoteTools.includes(tool)) {
    try { const output = calculate(tool, data); if (!finiteResults(output)) throw new Error('Hesaplama sınırı'); renderCalculation(output); status.textContent = 'Hesaplama tamamlandı.'; }
    catch { results.replaceChildren(element('p', 'Sonuç hesaplanamadı.')); status.textContent = 'Geçerli ve hesaplanabilir aralıkta değerler girin.'; }
    return;
  }
  busy = true; const button = form.querySelector('button'); button.disabled = true;
  const snapshot = new FormData(form); const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 65000);
  results.replaceChildren(element('p', tool === 'web-hiz-analizi' ? 'Google PageSpeed raporu hazırlanıyor…' : 'Sayfalar inceleniyor…')); status.textContent = 'Analiz yaklaşık bir dakika sürebilir.';
  try {
    if (tool !== 'web-hiz-analizi') { await analyzeSite(data, controller.signal); status.textContent = 'Ön inceleme tamamlandı.'; return; }
    const response = await fetch(`/api/pagespeed?${new URLSearchParams({ url: data.url, strategy: data.strategy })}`, { signal: controller.signal });
    const report = await response.json(); if (!response.ok) throw new Error(report.error || 'Analiz tamamlanamadı.');
    if (form.elements.url.value !== snapshot.get('url') || form.elements.strategy.value !== snapshot.get('strategy')) { status.textContent = 'Girdiler değişti. Yeni adres veya cihaz için analizi yeniden başlatın.'; return; }
    results.replaceChildren();
    metrics([['Performans skoru', report.score == null ? 'Veri yok' : `${report.score} / 100`], ...report.metrics.map(m => [m.label, m.value || 'Veri yok'])]);
    results.append(element('p', `Laboratuvar ölçümü · ${data.strategy === 'mobile' ? 'Mobil' : 'Masaüstü'}`), element('p', report.url));
    results.append(element('h3', 'Öncelikli iyileştirmeler'));
    const list = element('ul', null, 'improvements');
    for (const item of report.improvements) list.append(element('li', `${item.title}${item.value ? ` — ${item.value}` : ''}`));
    results.append(list.childElementCount ? list : element('p', 'Bu raporda öncelikli iyileştirme verisi bulunamadı.'));
    status.textContent = 'Analiz tamamlandı.';
  } catch (error) { results.replaceChildren(element('p', 'Rapor alınamadı.')); status.textContent = error.name === 'AbortError' ? 'Analiz zaman aşımına uğradı. Yeniden deneyin.' : error instanceof SyntaxError ? 'Analiz servisine ulaşılamıyor. Lütfen daha sonra deneyin.' : error.message; }
  finally { clearTimeout(timer); busy = false; button.disabled = false; }
});
document.querySelector('#category')?.addEventListener('change', event => {
  let count = 0; document.querySelectorAll('[data-category]').forEach(card => { card.hidden = Boolean(event.target.value && card.dataset.category !== event.target.value); if (!card.hidden) count++; });
  document.querySelector('#tool-count').textContent = `${count} araç`;
});
