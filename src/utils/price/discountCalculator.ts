
// Calculate discounts and final price
interface DiscountResult {
  totalAfterDiscount: number;
  discount: number;
  savings: number;
  deposit: number;
}

export function calculateDiscount(totalBeforeDiscount: number, touristTax: number): DiscountResult {
  console.log(`Calculating discount. Total before discount: ${totalBeforeDiscount}€`);
  
  // Round down to the nearest 50€
  const roundedPrice = Math.floor(totalBeforeDiscount / 50) * 50;
  console.log(`Rounded price: ${roundedPrice}€`);
  
  // Calculate the discount amount (difference between original total and rounded total)
  const discount = totalBeforeDiscount - roundedPrice;
  console.log(`Discount amount: ${discount}€`);
  
  // The savings include both the discount and the tourist tax
  const savings = discount + touristTax;
  console.log(`Total savings (discount + tourist tax): ${savings}€`);
  
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
