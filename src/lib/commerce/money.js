export function roundMoney(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
export function formatMoney(value, currency = "USD", locale = "en-US") { return new Intl.NumberFormat(locale, { style: "currency", currency }).format(Number(value || 0)); }
