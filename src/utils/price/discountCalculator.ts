
// Calculate discounts and final price
interface DiscountResult {
  totalAfterDiscount: number;
  discount: number;
  savings: number;
  deposit: number;
}

export function calculateDiscount(totalBeforeDiscount: number, touristTax: number): DiscountResult {
  // Round down to the nearest 50€
  const roundedPrice = Math.floor(totalBeforeDiscount / 50) * 50;
  
  // Calculate the discount amount (difference between original total and rounded total)
  // Total before discount already includes tourist tax, so we don't need to add it again
  const discount = totalBeforeDiscount - roundedPrice;
  
  // The savings should include both the discount and the tourist tax
  const savings = discount + touristTax;
  
  // Calculate deposit (30%)
  const deposit = Math.ceil(roundedPrice * 0.3);
  
  return {
    totalAfterDiscount: roundedPrice,
    discount,
    savings,
    deposit
  };
}
