
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
  
  // Calculate deposit (30%)
  const deposit = Math.ceil(roundedPrice * 0.3);
  console.log(`Deposit (30%): ${deposit}€`);
  
  return {
    totalAfterDiscount: roundedPrice,
    discount,
    savings,
    deposit
  };
}
