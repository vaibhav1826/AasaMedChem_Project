const CONVERSION_TO_BASE: Record<string, number> = {
  g: 1, 
  kg: 1000,
  mL: 1, 
  L: 1000,
  count: 1
}

export function toBase(qty: number, unit: string): number {
  const multiplier = CONVERSION_TO_BASE[unit]
  if (multiplier === undefined) {
    throw new Error(`Invalid unit: ${unit}`)
  }
  return qty * multiplier
}

export function calcLineTotal(baseQty: number, pricePerBase: number): number {
  return baseQty * pricePerBase
}

// Convert from base back to a specific unit (e.g. for display purposes if needed)
export function fromBase(baseQty: number, targetUnit: string): number {
  const divider = CONVERSION_TO_BASE[targetUnit]
  if (divider === undefined) {
    throw new Error(`Invalid unit: ${targetUnit}`)
  }
  return baseQty / divider
}
