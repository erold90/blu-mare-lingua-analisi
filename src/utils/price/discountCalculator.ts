
// Calculate discounts and final price
interface DiscountResult {
  totalAfterDiscount: number;
  discount: number;
  savings: number;
  deposit: number;
}

/**
 * Calculates the total price after applying discount by rounding down to the nearest 50€
 * When multiple apartments are selected, each apartment price is rounded individually
 * before being summed up for the final total
 * 
 * NOTE: touristTax is included only for reference - it does NOT affect the price calculations
 */
export function calculateDiscount(totalBeforeDiscount: number, touristTax: number): DiscountResult {
  console.log(`Calculating discount. Total before discount: ${totalBeforeDiscount}€`);
  
  // Round down to the nearest 50€
  const roundedPrice = Math.floor(totalBeforeDiscount / 50) * 50;
  console.log(`Rounded price: ${roundedPrice}€`);
  
  // Calculate the discount amount (difference between original total and rounded total)
  const discount = totalBeforeDiscount - roundedPrice;
  console.log(`Discount amount: ${discount}€`);
  
  // The savings are the same as the discount
  const savings = discount;
  console.log(`Total discount savings: ${savings}€`);
  
  // Calculate deposit: 
  // 1. Calculate 35% of the total price
  const maxDepositPercent = roundedPrice * 0.35;
  // 2. Round to nearest 100€ by first dividing by 100, then rounding, then multiplying by 100
  const deposit = Math.min(
    Math.round(roundedPrice * 0.3 / 100) * 100,
    Math.round(maxDepositPercent / 100) * 100
  );
  console.log(`Deposit (rounded to nearest 100€, max 35%): ${deposit}€`);
  
  return {
    totalAfterDiscount: roundedPrice,
    discount,
    savings,
    deposit
  };
}
