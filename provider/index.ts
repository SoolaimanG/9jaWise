import { create } from "zustand";

export type stateProps = {
  is_darkmode: boolean;
};
export type actionProps = {
  setIs_darkmode: (value: boolean) => void;
};

export const useStore = create<stateProps & actionProps>((set) => ({
  is_darkmode: false,
  setIs_darkmode(prop) {
    set((state) => ({
      ...state,
      is_darkmode: prop,
    }));
  },
}));
