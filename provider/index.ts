import { donationProps } from "@/Models/donation";
import { beneficiariesProps, userProps } from "@/Models/user";
import { responseProps } from "@/components/Bot/response";
import mongoose from "mongoose";
import { create } from "zustand";

type conversationProps = {
  id: string;
  user: string | null;
  chatBot: responseProps | null;
};

export type savingProps = {
  _id: mongoose.Types.ObjectId | string;
  icon_name: string;
  amount: number;
  date: Date;
  allow_withdraw: boolean;
  name: string;
  description: string;
  withdraw_with_password?: boolean;
};
export type stateProps = {
  is_darkmode: boolean;
  conversation: conversationProps[];
  KYC_steps: number[];
  savings: savingProps[];
  user: userProps<beneficiariesProps> | null;
  donation: donationProps[];
  refresh_count: number;
  darkmode: "dark" | "light";
};
export type actionProps = {
  setIs_darkmode: (value: boolean) => void;
  addConversation: (props: conversationProps) => void;
  updateConversation: (props: string, chatBot: responseProps) => void;
  clearChat: () => void;
  addKYC_steps: (props: number[]) => void;
  addSaving: (props: savingProps) => void;
  deleteSaving: (id: string) => void;
  setUser: (props: userProps<beneficiariesProps> | null) => void;
  addDonation: (props: donationProps) => void;
  delete_donation: (id: string) => void;
  try_refresh: () => void;
  set_Mode: (mode: "dark" | "light") => void;
};
export const useStore = create<stateProps & actionProps>((set) => ({
  is_darkmode: false,
  chatBotreply: [],
  conversation: [],
  savings: [],
  KYC_steps: [],
  donation: [],
  refresh_count: 0,
  user: null,
  darkmode: "light",
  setIs_darkmode(prop) {
    set((state) => ({
      ...state,
      is_darkmode: prop,
    }));
  },
  clearChat() {
    set(() => ({
      conversation: [],
    }));
  },
  addConversation(props) {
    set((state) => ({
      ...state,
      conversation: [...state.conversation, props],
    }));
  },
  updateConversation(id, chatBot) {
    set((state) => ({
      ...state,
      conversation: state.conversation.map((c) =>
        c.id === id ? { ...c, chatBot: chatBot } : { ...c }
      ),
    }));
  },
  addKYC_steps(props) {
    set((state) => ({
      ...state,
      KYC_steps: [...props],
    }));
  },
  addSaving(props) {
    set((state) => ({
      ...state,
      savings: [...state.savings, props],
    }));
  },
  deleteSaving(id) {
    set((state) => ({
      ...state,
      savings: state.savings.filter((i) => i._id.toString() !== id),
    }));
  },
  setUser(props) {
    set((state) => ({
      ...state,
      user: props,
    }));
  },
  addDonation(props) {
    set((state) => ({
      ...state,
      donation: [...state.donation, props],
    }));
  },
  delete_donation(id) {
    set((state) => ({
      ...state,
      donation: state.donation.filter((i) => i.id !== id),
    }));
  },
  set_Mode(mode) {
    set((state) => ({
      ...state,
      darkmode: mode,
    }));
  },
  try_refresh() {
    set((state) => ({
      ...state,
      refresh_count: state.refresh_count + 1,
    }));
  },
}));
