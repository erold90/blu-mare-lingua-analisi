
// Calculate discounts and final price
interface DiscountResult {
  totalAfterDiscount: number;
  discount: number;
  savings: number;
  deposit: number;
}

/**
 * FIXED: Calculates the total price after applying discount by rounding down to the nearest 50€
 * Deposit calculation is now more accurate and consistent
 */
export function calculateDiscount(totalBeforeDiscount: number, touristTax: number): DiscountResult {
  console.log(`💰 Calculating discount. Total before discount: ${totalBeforeDiscount}€`);
  
  // Round down to the nearest 50€
  const roundedPrice = Math.floor(totalBeforeDiscount / 50) * 50;
  console.log(`🎯 Rounded price: ${roundedPrice}€`);
  
  // Calculate the discount amount (difference between original total and rounded total)
  const discount = totalBeforeDiscount - roundedPrice;
  console.log(`🏷️ Discount amount: ${discount}€`);
  
  // The savings are the same as the discount
  const savings = discount;
  console.log(`💵 Total discount savings: ${savings}€`);
  
  // FIXED: Calculate deposit more accurately
  // 1. Base deposit is 30% of final price (after discounts)
  const baseDeposit = roundedPrice * 0.30;
  
  // 2. Round to nearest 50€ instead of 100€ for better accuracy
  const roundedDeposit = Math.round(baseDeposit / 50) * 50;
  
  // 3. Ensure minimum deposit of 200€ and maximum of 35% of total
  const maxDeposit = Math.round((roundedPrice * 0.35) / 50) * 50;
  const minDeposit = 200;
  
  const deposit = Math.max(minDeposit, Math.min(roundedDeposit, maxDeposit));
  
  console.log(`🏦 Deposit calculation:
    - Base (30%): ${baseDeposit}€
    - Rounded to 50€: ${roundedDeposit}€
    - Min: ${minDeposit}€, Max (35%): ${maxDeposit}€
    - Final deposit: ${deposit}€`);
  
  // Validation checks
  if (deposit > roundedPrice) {
    console.warn("⚠️ Deposit is higher than total price! Adjusting...");
    const adjustedDeposit = Math.round(roundedPrice * 0.30 / 50) * 50;
    return {
      totalAfterDiscount: roundedPrice,
      discount,
      savings,
      deposit: Math.max(200, adjustedDeposit)
    };
  }
  
  return {
    totalAfterDiscount: roundedPrice,
    discount,
    savings,
    deposit
  };
}
