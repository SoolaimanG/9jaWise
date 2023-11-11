export const useNairaFormatter = (amount: number) => {
  // Create an Intl NumberFormat object for currency formatting in NGN
  const formatAmount = Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount >= 1000000 ? amount / 1000000 : amount);

  // Add "M" suffix if the amount is greater than or equal to 1,000,000 (1 million)
  return amount >= 1000000 ? formatAmount + "M" : formatAmount;
};
