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

export function assertUnitCompatible(orderedUnit: string, baseUnit: string): void {
  const allowed = UNITS_FOR_BASE_UNIT[baseUnit]
  if (!allowed?.includes(orderedUnit)) {
    throw new Error(
      `Unit "${orderedUnit}" is not valid for a product stored in ${baseUnit}. Allowed: ${allowed?.join(", ") ?? orderedUnit}`
    )
  }
}

export function assertPositiveQuantity(quantity: number): void {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive number")
  }
}
