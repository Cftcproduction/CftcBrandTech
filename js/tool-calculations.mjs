export function calculate(tool, d) {
  const positive = (...keys) => keys.forEach(k => { if (!Number.isFinite(d[k]) || d[k] <= 0) throw new Error(k); });
  const nonnegative = (...keys) => keys.forEach(k => { if (!Number.isFinite(d[k]) || d[k] < 0) throw new Error(k); });
  const rate = () => { positive('rate'); if (d.rate > 100) throw new Error('rate'); };
  const integer = k => { if (!Number.isInteger(d[k])) throw new Error(k); };
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
