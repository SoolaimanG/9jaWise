import mongoose, { Schema, model, models } from "mongoose";

export interface requestOTPProps {
  otp_for: string;
  otp: number;
  requestCount: number;
  otp_used: boolean;
  nextRequest: number;
  expires: number;
}

const RequestOTP = new Schema<requestOTPProps>({
  otp_for: String,
  otp: Number,
  otp_used: Boolean,
  requestCount: Number,
  nextRequest: Number,
  expires: Number,
});

export const requestOTPModel =
  models?.requestotp ?? model<requestOTPProps>("requestotp", RequestOTP);

export const checkIfUserAlreadyRequestedByEmail = async (otp_for: string) => {
  const res: requestOTPProps | null = await requestOTPModel.findOne({
    otp_for: otp_for,
  });
  return res;
};

export const checkOTP = async (otp: number) => {
  const res: requestOTPProps | null = await requestOTPModel.findOne({
    otp: otp,
  });

  return res;
};

export const checkOTpWithPhoneNumber = async function (phoneNumber: string) {
  const res: requestOTPProps | null = await requestOTPModel.findOne({
    otp_for: phoneNumber,
  });

  return res;
};
