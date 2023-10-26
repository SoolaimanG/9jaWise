import { Schema, model, models } from "mongoose";

export interface inviteProps {
  userId: string;
  inviteeEmail: string;
  date: Date;
  message: string;
  inviterEmail: string;
}

const inviteSchema = new Schema<inviteProps>({
  userId: String,
  inviteeEmail: String,
  date: Date,
  message: String,
  inviterEmail: String,
});

export const inviteModel =
  models?.invitemodels ?? model("invitemodels", inviteSchema);
