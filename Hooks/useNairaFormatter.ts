export const useNairaFormatter = (amount: number) => {
  const formatAmount = Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount >= 1000000 ? amount / 1000000 : amount);

  return amount >= 1000000 ? formatAmount + "M" : formatAmount;
};
