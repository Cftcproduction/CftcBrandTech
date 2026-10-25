export function parseTurkishNumber(value) {
  const text = String(value).trim();
  if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(text)) return NaN;
  return Number(text.replaceAll('.', '').replace(',', '.'));
}

export function calculate(tool, d) {
  const positive = (...keys) => keys.forEach(k => { if (!Number.isFinite(d[k]) || d[k] <= 0) throw new Error(k); });
  const nonnegative = (...keys) => keys.forEach(k => { if (!Number.isFinite(d[k]) || d[k] < 0) throw new Error(k); });
  const rate = () => { positive('rate'); if (d.rate > 100) throw new Error('rate'); };
  const integer = k => { if (!Number.isInteger(d[k])) throw new Error(k); };
  if (tool === 'reklam-karlilik') {
    positive('spend', 'margin'); nonnegative('revenue', 'customers'); integer('customers'); if (d.margin > 100) throw new Error('margin');
    return { roas: d.revenue / d.spend, cpa: d.customers ? d.spend / d.customers : null, breakEven: 100 / d.margin, breakEvenRevenue: d.spend / (d.margin / 100), contribution: d.revenue * d.margin / 100 - d.spend };
  }
  if (tool === 'eticaret-kar') {
    positive('price'); nonnegative('cost', 'commission', 'shipping', 'adCost', 'returns'); if (d.commission > 100) throw new Error('commission');
    const commissionCost = d.price * d.commission / 100;
    const costs = [['Ürün', d.cost], ['Komisyon', commissionCost], ['Kargo', d.shipping], ['Reklam', d.adCost], ['Beklenen iade', d.returns]];
    const total = costs.reduce((sum, [, value]) => sum + value, 0), contribution = d.price - total;
    return { total, contribution, margin: contribution / d.price * 100, maxAdCost: d.price - (total - d.adCost), costs };
  }
  if (tool === 'buyume-firsatlari') {
    positive('current', 'target'); nonnegative('budget');
    const missing = [d.website !== 'yes' && 'Dönüşüme odaklı bir web sitesi oluşturun.', !d.analytics && 'Dönüşüm ölçümünü ve hedef olaylarını kurun.', !d.seo && 'Hedef sayfalar için SEO ve içerik planı hazırlayın.', !d.crm && 'Potansiyel müşteri ve satış takibini CRM ile düzenleyin.', !d.ads && 'Ölçüm hazır olduğunda kontrollü bir reklam testi planlayın.'].filter(Boolean);
    return { score: [d.website === 'yes', d.analytics, d.seo, d.ads, d.crm].filter(Boolean).length * 20, growth: (d.target / d.current - 1) * 100, budgetRatio: d.budget / d.current * 100, priorities: missing.length ? missing : ['Mevcut kanalların dönüşüm ve katkı performansını karşılaştırın.', 'Kontrollü açılış sayfası ve reklam testleri yapın.'], sector: d.sector };
  }
  if (tool === 'roas') { positive('spend'); nonnegative('revenue'); return { roas: d.revenue / d.spend, percent: d.revenue / d.spend * 100 }; }
  if (tool === 'meta-ads-cpl-cpa') { nonnegative('spend', 'leads', 'customers'); integer('leads'); integer('customers'); return { cpl: d.leads ? d.spend / d.leads : null, cpa: d.customers ? d.spend / d.customers : null }; }
  if (tool === 'google-ads-butce') {
    positive('conversions', 'cpc', 'days'); integer('conversions'); integer('days'); rate(); if (d.days > 366) throw new Error('days');
    const clicks = Math.ceil(d.conversions / (d.rate / 100)), budget = clicks * d.cpc;
    if (!['sales', 'leads'].includes(d.mode)) throw new Error('mode');
    if (d.mode === 'sales') positive('basket');
    return { clicks, budget, daily: budget / d.days, ...(d.mode === 'sales' ? { revenue: d.conversions * d.basket, roas: d.conversions * d.basket / budget } : {}) };
  }
  if (tool === 'buyume-hedefi') {
    positive('current', 'target', 'months', 'basket', 'roas'); integer('months'); rate(); if (d.months > 120) throw new Error('months');
    const factor = (d.target / d.current) ** (1 / d.months);
    const rows = Array.from({ length: d.months }, (_, i) => {
      const revenue = i === d.months - 1 ? d.target : d.current * factor ** (i + 1);
      const orders = Math.ceil(revenue / d.basket);
      return { month: i + 1, revenue, orders, traffic: Math.ceil(orders / (d.rate / 100)), budget: revenue / d.roas };
    });
    return { growth: (d.target / d.current - 1) * 100, monthly: (factor - 1) * 100, rows };
  }
  throw new Error('Bilinmeyen araç');
}
