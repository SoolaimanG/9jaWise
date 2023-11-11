import mongoose, { Schema, model, models } from "mongoose";

export type account_number_props = {
  _id: mongoose.Types.ObjectId;
  account_number: string;
  account_name: string;
  bank_name: string;
  account_type: "donation" | "basic" | "sub_account";
  is_permanent: boolean;
  expires: number;
  ref_id: string;
  created_by: string;
};

const AccountSchema = new Schema<account_number_props>(
  {
    _id: mongoose.Types.ObjectId,
    account_name: String,
    account_number: { type: String, unique: true },
    bank_name: String,
    account_type: {
      type: String,
      enum: ["donation", "basic", "sub_account"],
    },
    is_permanent: Boolean,
    expires: Number,
    ref_id: String,
    created_by: String,
  },
  {
    timestamps: true,
  }
);

export const AccountModel =
  models?.accountnumbers ?? model("accountnumbers", AccountSchema);
