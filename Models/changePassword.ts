import mongoose, { Schema, models, model } from "mongoose";

export interface changePassword {
  _id: mongoose.Types.ObjectId;
  user_id: string;
  loginID: string;
  expireOn: number;
  status: "requested" | "changed";
}

const change_password_schema = new Schema<changePassword>({
  _id: Schema.Types.ObjectId,
  loginID: String,
  user_id: String,
  expireOn: Number,
  status: {
    type: String,
    enum: ["requested", "changed"],
  },
});

export const changePasswordSchema =
  models?.changepasswords ??
  model<changePassword>("changepasswords", change_password_schema);
