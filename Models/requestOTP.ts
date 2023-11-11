// Import required modules from the Mongoose library
import { Schema, model, models } from "mongoose";

// Define the structure of the 'requestOTP' object
export interface requestOTPProps {
  otp_for: string;
  otp: string;
  requestCount: number;
  otp_used: boolean;
  nextRequest: number;
  expires: number;
}

// Create a Mongoose schema for the 'requestOTP' object
const RequestOTP = new Schema<requestOTPProps>({
  otp_for: String, // Field to store the purpose of the OTP
  otp: String, // Field to store the OTP value
  otp_used: Boolean, // Field to track whether the OTP has been used
  requestCount: Number, // Field to store the count of requests
  nextRequest: Number, // Field to store the next request timestamp
  expires: Number, // Field to store the expiration timestamp
});

// Define a Mongoose model for the 'requestOTP' schema
export const requestOTPModel =
  models?.requestotp ?? model<requestOTPProps>("requestotp", RequestOTP);

// Function to check if a user has already requested an OTP by email
export const checkIfUserAlreadyRequestedByEmail = async (otp_for: string) => {
  // Attempt to find a matching document in the database
  const res: requestOTPProps | null = await requestOTPModel.findOne({
    otp_for: otp_for,
  });

  return res;
};

// Function to check OTP validity by its value
export const checkOTP = async (otp: string) => {
  // Attempt to find a matching document in the database
  const res: requestOTPProps | null = await requestOTPModel.findOne({
    otp: otp,
  });

  return res;
};

// Function to check OTP validity by phone number
export const checkOTpWithPhoneNumber = async function (phoneNumber: string) {
  // Attempt to find a matching document in the database
  const res: requestOTPProps | null = await requestOTPModel.findOne({
    otp_for: phoneNumber,
  });

  return res;
};
