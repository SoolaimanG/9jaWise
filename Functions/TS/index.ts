import nodemailer from "nodemailer";
import { randomBytes, createHmac } from "crypto";
import { UserModel } from "@/Models/user";
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
  id: number;
  amount: number;
};

type props = {
  email: string;
  bvn: string;
  firstname: string;
  lastname: string;
  phoneNumber: number | null;
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

export type static_account_props = {
  status: string;
  message: string;
  meta: {
    authorization: {
      transfer_reference: string;
      transfer_account: number;
      transfer_bank: string;
      account_expiration: number;
      transfer_note: string;
      transfer_amount: number;
      mode: string;
    };
  };
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
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendWhatsAppMessage = async (props: whatsappProps) => {
  const { body, number } = props;
  client.messages
    .create({
      from: "whatsapp:+14155238886",
      body: body,
      to: `whatsapp:${number}`,
    })
    //@ts-ignore
    .then((message) => console.log("Sent"))
    .catch((err: any) => console.log(err));
};

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

export const generateAccountNumber = async ({
  email,
  bvn,
  firstname,
  lastname,
  phoneNumber,
}: props) => {
  try {
    const body = {
      email,
      is_permanent: true,
      firstname,
      lastname,
      bvn,
      phoneNumber,
    };

    const res = await fetch(
      "https://api.flutterwave.com/v3/virtual-account-numbers",
      {
        method: "POST",
        headers: {
          Authorization: String(process.env.FLW_SECRET_KEY),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      const data: generateAccountProps = await res.json();
      return { ...data };
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error) {
    console.error("Error generating account number:", error);
    throw error;
  }
};

export const countEmails = async (_id: string, emailSent: number) => {
  const updateValues = {
    logs: {
      lastTransaction: 0,
      totalEmailSent: emailSent + 1,
    },
  };

  try {
    const res = await UserModel.findByIdAndUpdate(_id, updateValues);
    Promise.resolve(res);
  } catch (error) {
    const err = error;
    Promise.reject(err);
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

export const get_trf_charge = async (amount: string | number) => {
  let charge: null | number = null;

  const res = await fetch(
    `https://api.flutterwave.com/v3/transfers/fee?amount=${amount}&currency=NGN`,
    {
      headers: {
        Authorization: String(process.env.FLW_SECRET_KEY),
      },
    }
  );

  if (!res.ok) {
    charge = null;
    return;
  }

  const data = await res.json();

  charge = data?.data?.fee;

  return charge;
};

export const get_static_account_number = async ({
  amount,
  tx_ref,
  email,
  meta,
  is_permanent,
  bvn,
}: {
  amount: number;
  tx_ref: string;
  email: string;
  meta: static_account_meta | null;
  is_permanent?: boolean;
  bvn?: string;
}) => {
  const payload = {
    email: email,
    currency: "NGN",
    tx_ref: tx_ref,
    amount: amount,
    meta: meta,
  };

  let accountDetails: null | static_account_props = null;

  const res = await fetch(
    `https://api.flutterwave.com/v3/charges?type=bank_transfer`,
    {
      method: "POST",
      headers: {
        Authorization: String(process.env.FLW_SECRET_KEY),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    accountDetails = null;
    return;
  }

  const data = await res.json();

  accountDetails = data;

  return accountDetails;
};

export const refund_user = async ({ id, amount }: refundType) => {
  const payload = {
    id: id,
    amount: amount,
  };

  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${id}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: String(process.env.FLW_SECRET_KEY),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    Promise.reject(res.statusText);
    return;
  }

  Promise.resolve(res.statusText);
};

export const sanitize_input = async (user_input: string) => {
  if (!user_input) return;

  return user_input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
