import { calculate } from './tool-calculations.mjs';
const number = value => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(value);
const money = value => `${number(value)} TL`;
const results = document.querySelector('#results');
const form = document.querySelector('#tool-form');
const status = document.querySelector('#form-status');
const tool = document.body.dataset.tool;
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
}
function modeChanged() {
  if (tool !== 'google-ads-butce') return;
  const hidden = form.elements.mode.value === 'leads';
  document.querySelector('#basket-field').hidden = hidden;
  form.elements.basket.disabled = hidden;
}
form?.addEventListener('input', () => { modeChanged(); results.replaceChildren(element('p', 'Veriler değişti. Güncel sonuçlar için yeniden hesaplayın.')); status.textContent = ''; });
modeChanged();
let busy = false;
form?.addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  let firstInvalid;
  form.querySelectorAll('input').forEach(input => {
    const invalid = !input.disabled && !input.validity.valid;
    input.setAttribute('aria-invalid', String(invalid));
    const error = form.querySelector(`[data-error="${input.name}"]`);
    if (error) { error.id = `error-${input.name}`; input.setAttribute('aria-describedby', error.id); error.textContent = invalid ? input.validationMessage : ''; }
    if (invalid && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) { results.replaceChildren(element('p', 'Sonuç için işaretli alanları düzeltin.')); firstInvalid.focus(); return; }
  const data = Object.fromEntries(new FormData(form));
  for (const key of Object.keys(data)) if (!['url', 'strategy', 'mode'].includes(key)) data[key] = Number(data[key]);
  status.textContent = '';
  if (tool !== 'web-hiz-analizi') {
    try { const output = calculate(tool, data); if (!finiteResults(output)) throw new Error('Hesaplama sınırı'); renderCalculation(output); status.textContent = 'Hesaplama tamamlandı.'; }
    catch { results.replaceChildren(element('p', 'Sonuç hesaplanamadı.')); status.textContent = 'Geçerli ve hesaplanabilir aralıkta değerler girin.'; }
    return;
  }
  busy = true; const button = form.querySelector('button'); button.disabled = true;
  const snapshot = new FormData(form); const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 65000);
  results.replaceChildren(element('p', 'Google PageSpeed raporu hazırlanıyor…')); status.textContent = 'Analiz yaklaşık bir dakika sürebilir.';
  try {
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
