export type hideBalanceProps = {
  hideBalance: boolean;
  balance: number;
};

export const useBalanceHider = (props: hideBalanceProps) => {
  const { hideBalance, balance } = props;
  return hideBalance
    ? "******"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(balance);
};
