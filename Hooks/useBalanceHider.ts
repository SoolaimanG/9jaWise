//---------->All Imports<----------
import { useNairaFormatter } from "./useNairaFormatter";

export type hideBalanceProps = {
  hideBalance: boolean; //True or False depends on user prefrence if they waht to hide thier balanc
  balance: number; //Recieve user balance
};

/**
 * -UseBalanceHider--> A custom hook for hiding balance for user
 *
 * @param {hideBalanceProps} -{Hidebalnace which can be True or False to hide and a balance amount}
 * @returns {string} -{Return a string which is either '*****' or an INt'l format of currency in NGN}
 */

export const useBalanceHider = (props: hideBalanceProps) => {
  const { hideBalance, balance } = props; //Destucturiing the props

  const amount_in_naira = useNairaFormatter(balance);

  /**
   * If the hidebalance is True return a dtring of ***** or the User balance
   */
  return hideBalance ? "******" : amount_in_naira;
};
