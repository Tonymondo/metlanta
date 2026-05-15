export interface FeeResult {
  fee: number
  payout: number
  rate: number
}

/**
 * Tiered fee engine for Metlanta ticket purchases.
 * All values returned are in USD (dollars, not cents).
 */
export function calculateFee(priceUsd: number): FeeResult {
  if (priceUsd <= 0) {
    return { fee: 0, payout: 0, rate: 0 }
  }

  let rate: number

  if (priceUsd <= 25) {
    rate = 0.22
  } else if (priceUsd <= 50) {
    rate = 0.20
  } else if (priceUsd <= 100) {
    rate = 0.17
  } else {
    rate = 0.15
  }

  let fee = priceUsd * rate

  // Minimum fee of $1.50 for the $0.01–$25 tier
  if (priceUsd <= 25) {
    fee = Math.max(fee, 1.50)
  }

  // Round to 2 decimal places
  fee = Math.round(fee * 100) / 100
  const payout = Math.round((priceUsd - fee) * 100) / 100

  return { fee, payout, rate }
}
