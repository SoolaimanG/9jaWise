import mongoose, { model, models, Schema } from "mongoose";

export interface donationProps {
  _id: string | mongoose.Types.ObjectId;
  donation_name: string;
  description: string;
  date: Date;
  target_amount: number;
  amount_raised: number;
  donation_link: string;
  created_by: string;
  user_id: string;
  donators: {
    name: string;
    amount: number;
    date: Date;
  }[];
  donation_account: {
    account_number: string;
    account_name: string;
    bank_name: string;
  };
}

const DonationSchema = new Schema<donationProps>({
  _id: Schema.Types.ObjectId,
  donation_name: String,
  description: String,
  date: Date,
  target_amount: Number,
  amount_raised: Number,
  donation_link: String,
  created_by: String,
  donators: Array,
  user_id: String,
  donation_account: {
    account_name: String,
    account_number: Number,
    bank_name: String,
  },
});

export const DonationModel =
  models?.donations ?? model("donations", DonationSchema);
