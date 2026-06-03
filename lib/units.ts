export const CONVERSION_TO_BASE: Record<string, number> = {
  g: 1, kg: 1000,
  mL: 1, L: 1000,
  count: 1
}

export const UNITS_FOR_BASE_UNIT: Record<string, string[]> = {
  g: ['g', 'kg'],
  mL: ['mL', 'L'],
  count: ['count']
}

export function toBaseQuantity(quantity: number, unit: string): number {
  const factor = CONVERSION_TO_BASE[unit]
  if (!factor) throw new Error(`Unknown unit: ${unit}`)
  return quantity * factor
}

export function fromBaseQuantity(baseQty: number, targetUnit: string): number {
  const factor = CONVERSION_TO_BASE[targetUnit]
  if (!factor) throw new Error(`Unknown unit: ${targetUnit}`)
  return baseQty / factor
}

export function calcLineTotal(baseQty: number, pricePerBase: number): number {
  return baseQty * pricePerBase
}
