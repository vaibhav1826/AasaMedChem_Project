export function formatINR(amount: number | string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(Number(amount))
}

export function formatQtyWithUnit(qty: number | string, unit: string): string {
  return `${Number(qty).toLocaleString('en-IN')} ${unit}`
}
