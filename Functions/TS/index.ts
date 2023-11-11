import nodemailer from "nodemailer";
import { randomBytes, createHmac } from "crypto";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail_Password,
  findUserByPhoneNumber_Password,
  userProps,
} from "@/Models/user";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export type generateAccountProps = {
  flw_ref: string;
  order_ref: string;
  account_number: number;
  account_status: "active";
  frequency: 1;
  bank_name: string;
  created_at: number;
  expiry_date: number;
  amount: number;
};

export type whatsappProps = {
  body: string;
  number: string;
};

type refundType = {
  user_id: string;
  amount: number;
  old_balance: number;
};

export type static_account_meta = {
  user_id: string;
  username?: string;
  note?: string;
  type: "donation" | "fund_account" | "bulk_accounts";
  ref_id?: string;
};

export type ip_addressProps = {
  country_name: string;
  country_code: string;
  IPv4: string;
  state: string;
};

export const currentTime = () => {
  const hour = new Date().getHours();

  let dayDuration: string = "Evening"; // Default value

  switch (true) {
    case hour >= 23:
      dayDuration = "Evening";
      break;
    case hour >= 12:
      dayDuration = "Afternoon";
      break;
    case hour >= 5:
      dayDuration = "Morning";
      break;
    default:
      dayDuration = "Evening";
      break;
  }

  return dayDuration;
};

export const randomStrings = () => {
  const randomStrings = Math.random().toString(36).substring(2);
  return randomStrings;
};

export const regexTesting = (
  type: "email" | "password",
  value: string
): boolean => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  switch (type) {
    case "email":
      return emailRegex.test(value);
    case "password":
      return passwordRegex.test(value);
    default:
      return false; // Return false for unsupported types
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  ignoreTLS: true,
  auth: {
    user: process.env.GOOGLE_EMAIL_ADDRESS as string,
    pass: process.env.BREVO_APP_PASSWORD as string,
  },
  from: "suleimaangee@gmail.com",
});

export const sendEmail = async ({
  emailTemplate,
  emailTo,
  emailSubject,
}: {
  emailTemplate: string;
  emailTo: string | string[];
  emailSubject: string;
}) => {
  if (!emailTo || emailTo.length === 0) {
    return;
  }

  try {
    const res = await transporter.sendMail({
      from: "no-reply@gmail.com",
      to: emailTo,
      subject: emailSubject,
      html: emailTemplate,
    });

    return Promise.resolve<SMTPTransport.SentMessageInfo>(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const generateOTP = (length: number) => {
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * 9);

    otp += randomNum;
  }

  return otp;
};

export const random = (size: number) => {
  return randomBytes(size).toString("base64");
};

export const hashText = (salt: string, text: string) => {
  const hash = createHmac("sha256", [salt, text].join("/"))
    .update(process.env.AUTH_SECRET_KEY!)
    .digest("hex");

  return hash;
};

//HELPER FUNCTION TO HELP SENT OTP THROUGH PHONE NUMBER
//const client = require("twilio")(
//  process.env.TWILIO_ACCOUNT_SID,
//  process.env.TWILIO_AUTH_TOKEN
//);
//
//export const sendWhatsAppMessage = async (props: whatsappProps) => {
//  const { body, number } = props;
//  client.messages
//    .create({
//      from: "whatsapp:+14155238886",
//      body: body,
//      to: `whatsapp:${number}`,
//    })
//    //@ts-ignore
//    .then((message) => console.log("Sent"))
//    .catch((err: any) => console.log(err));
//};

//FLUTTERWAVE APIs And PayStack APIs
export const getAllBanks = async (number: number) => {
  try {
    const res = await fetch("https://api.flutterwave.com/v3/banks/NG", {
      headers: {
        Authorization: String(process.env.FLW_SECRET_KEY),
      },
    });

    const data = await res.json();

    return data?.data.slice(0, number);
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong");
  }
};

export const disableAcct = async (userId: string) => {
  try {
    const updateOptions = {
      disableAccount: false,
    };

    await UserModel.findByIdAndUpdate(userId, updateOptions);

    return new Response(null, {
      status: 200,
      statusText: "OK",
    });
  } catch (error) {
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};

export const get_ipAddress = async () => {
  let ip_address: ip_addressProps | null = null;
  const res = await fetch("https://geolocation-db.com/json/");

  const data = await res.json();

  if (!res.ok) {
    ip_address = null;
    return ip_address;
  }

  ip_address = data;
  return ip_address;
};

export const refund_user = async ({
  user_id,
  amount,
  old_balance,
}: refundType) => {
  const updates: userProps<beneficiariesProps> | {} = {
    balance: old_balance + amount,
  };

  await UserModel.findByIdAndUpdate(user_id, updates);
};

export const sanitize_input = async (user_input: string) => {
  return user_input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

export const generate_mock_bank = async (date_of_birth: Date) => {
  //
  const IDENTIFIER = "10";

  const current_time = Date.now();

  const day = date_of_birth.getDay();
  const year = date_of_birth.getFullYear();

  const get_random_year = Math.floor((year / Math.random()) * 9); //Divide year by random number from 0 to 9

  //We always want the get_random_year length should be equal to three thats why this check is necessary
  const new_year =
    get_random_year.toString().length === 3
      ? get_random_year.toString() + Math.floor(Math.random() * 9)
      : get_random_year.toString();

  let current_time_random_index = "";

  //From the current_time which is millisecond of today's date,month,year,hours,minute and seconds (conbination) get random numbers from it
  for (let i = 0; i < current_time.toString().length / 2; i++) {
    //const element = array[i];
    const random_index = Math.floor(
      Math.random() * current_time.toString().length
    );

    current_time_random_index = current_time.toString()[random_index];
  }

  const unique_account_number = IDENTIFIER.concat(current_time_random_index)
    .concat(new_year)
    .concat(Math.floor(Math.random() * day).toString())
    .concat(Math.floor(Math.random() * 9).toString());

  return unique_account_number.length > 10
    ? unique_account_number.slice(0, 10)
    : unique_account_number;
};

export const user_with_password = async (
  user_id: string,
  type: "email" | "phoneNumber"
) => {
  const user: userProps<beneficiariesProps> =
    type === "email"
      ? await findUserByEmail_Password(user_id)
      : await findUserByPhoneNumber_Password(user_id);

  return user;
};
