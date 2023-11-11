import { statusProps } from "@/components/loaders";
import { donationProps, savingProps } from "@/provider";
import mongoose, { models, model, Schema } from "mongoose"; // Importing necessary modules from mongoose
import { connectDatabase } from ".";
import { subaccountTypes } from "@/components/Account/subAccounts";

export type transactiontypes = "debit" | "credit" | "airtime" | "bill payments";

// Define types for historyProps, notificationsProps, and kyc_steps
export type historyProps = {
  type: transactiontypes;
  amount: number;
  transactionFrom?: string;
  transactionTo?: string;
  refID: string;
  status: statusProps;
  date: number;
  phoneNumber?: number;
  name: string;
};

export type notificationsProps = {
  type: "email" | "credit" | "debit" | "warning" | "info" | "airtime" | "bill";
  billMessage?: string;
  header?: string;
  amount?: number;
  acct?: number;
  message?: string;
  time: number;
  isRead?: boolean;
  transactionID?: string;
  paymentFor?: string | number;
};

export interface settingsProps {
  hidebalance: boolean;
  send_otp_for_each_transaction: boolean;
  whitelist_ip: boolean;
  twoFactorAuthentication: boolean;
  disableTransfer: boolean;
}

export type kyc_steps = "first" | "second" | "third";

export type beneficiariesProps = {
  accountName: string;
  accountNumber: string;
  bankName: string;
  account_bank: string;
};

// Define the userProps interface
export interface userProps<T> {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string | null;
  ip_address: string | null;
  username: string;
  emailVerified?: boolean;
  phoneNumberVerified?: boolean;
  acceptTermsAndConditions: boolean;
  backupCodes: {
    backupCode_i: string;
    backupCode_ii: string;
    backupCode_iii: string;
  };
  phoneNumber?: string | null;
  BVN: {
    bvnNumber: string | null;
    salt: string;
  };
  disableAccount: boolean;
  profileImage: string;
  KYC: {
    gender: "male" | "female";
    address: {
      street_address: string | null;
      city: string | null;
      nationality: string | null;
      state: string | null;
      place_of_birth: string | null;
    };
    nextOfKin: {
      name: string;
      nok: string;
    };
    marital_status: "single" | "married";
    date_of_birth: Date | null;
  };
  account: {
    accountNumber: number | null;
    accountBank: string | null;
    accountName: string | null;
  };
  authentication: {
    salt: string;
    password: string;
    previous_password: string;
    request_password_reset: boolean;
  };
  history: historyProps[];
  beneficiaries: T[];
  balance: number;
  loginMode: "email" | "phoneNumber";
  loginType: "otp" | "password";
  accountType: "personal" | "business";
  logs: {
    lastLogin: number;
    lastTransaction: {
      tran_type: "credit" | "debit" | null;
      amount: number | null;
    };
    totalEmailSent: number;
  };
  security_questions: {
    question: string;
    answer: string;
  };
  notifications: notificationsProps[];
  bulkAccountsCreated: subaccountTypes[];
  occupation: string;
  KYC_completed: boolean;
  kyc_steps: kyc_steps[];
  savings: savingProps[];
  settings: settingsProps;
  suspisiousLogin: boolean;
  loginAttempts: {
    count: number;
    last_attempt: Date;
    ip_address: string;
    reason: string;
  };
  donation_campaigns: donationProps[];
}

// Define the Mongoose schema for the user
const UserSchema = new Schema<userProps<beneficiariesProps>>({
  _id: Schema.Types.ObjectId,
  fullName: String,
  email: String,
  emailVerified: Boolean,
  username: String,
  phoneNumber: String,
  phoneNumberVerified: Boolean,
  profileImage: String,
  ip_address: String || null,
  BVN: {
    bvnNumber: { type: String, select: false },
    salt: { type: String, select: false },
  },
  account: {
    accountBank: String,
    accountName: String,
    accountNumber: { type: String, default: null },
  },
  acceptTermsAndConditions: Boolean,
  disableAccount: Boolean,
  KYC: {
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    address: {
      street_address: String,
      city: String,
      nationality: String,
      state: String,
      place_of_birth: String,
    },
    nextOfKin: {
      name: String,
      nok: String,
    },
    marital_status: {
      type: String,
      enum: ["single", "married"],
    },
    date_of_birth: { type: Date, default: null },
  },
  backupCodes: {
    backupCode_i: { type: String, select: false },
    backupCode_ii: { type: String, select: false },
    backupCode_iii: { type: String, select: false },
  },
  accountType: {
    type: String,
    enum: ["personal", "business"],
  },
  authentication: {
    salt: { type: String, select: false },
    password: { type: String, select: false },
    previous_password: { type: String, select: false },
    request_password_reset: Boolean,
  },
  history: [],
  beneficiaries: [],
  occupation: String,
  balance: Number,
  loginMode: {
    type: String,
    enum: ["email", "phoneNumber"],
  },
  loginType: {
    type: String,
    enum: ["otp", "password"],
  },
  logs: {
    lastLogin: Number,
    lastTransaction: {
      tran_type: { type: String, enum: ["credit", "debit"] },
      amount: Number,
    },
    totalEmailSent: Number,
  },
  settings: {
    hidebalance: Boolean,
    send_otp_for_each_transaction: Boolean,
    whitelist_ip: Boolean,
    twoFactorAuthentication: Boolean,
    disableTransfer: Boolean,
  },
  notifications: [],
  savings: [],
  security_questions: {
    question: { type: String, select: false },
    answer: { type: String, select: false },
  },
  bulkAccountsCreated: [],
  KYC_completed: Boolean,
  kyc_steps: {
    type: [String],
    enum: ["first", "second", "third"],
  },
  suspisiousLogin: Boolean,
  loginAttempts: {
    count: Number,
    ip_address: String,
    reason: String,
    date: Date,
  },
  donation_campaigns: Array,
});

// Create or retrieve the UserModel
export const UserModel = models?.users ?? model("users", UserSchema);

// Functions to find users by various criteria
export const findUserById = async (_id: string) => {
  const res = await UserModel.findById(_id);

  return res;
};
export const findUserByEmail = async (email: string) => {
  await connectDatabase();
  const res: userProps<beneficiariesProps> | null = await UserModel.findOne({
    email: email,
  });

  return res;
};
export const findUserByPhoneNumber = async (phoneNumber: string | number) => {
  const res: userProps<beneficiariesProps> | null = await UserModel.findOne({
    phoneNumber: phoneNumber,
  });

  return res;
};
export const findUserByEmail_Password = async (email: string) => {
  const res = await UserModel.findOne({ email: email }).select(
    "authentication"
  );

  return res;
};
export const findUserById_Password = async (id: string) => {
  const res = await UserModel.findOne({ _id: id }).select("authentication");

  return res;
};
export const findUserByPhoneNumber_Password = async (
  phoneNumber: string | number
) => {
  const res = await UserModel.findOne({ phoneNumber: phoneNumber }).select(
    "authentication"
  );

  return res;
};
export const createUser = async ({
  userData,
}: {
  userData: userProps<beneficiariesProps>;
}) => {
  try {
    const user = new UserModel<userProps<beneficiariesProps>>({
      ...userData,
    });

    const accountCreated = await user.save();

    return Promise.resolve(accountCreated);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const pushNotification = async (
  userId: string,
  newNotification: notificationsProps
) => {
  try {
    // Find the user document by ID
    const user: userProps<beneficiariesProps> | null = await UserModel.findById(
      userId
    );

    if (!user) {
      throw new Error("User not found");
    }

    const all_notification = [...user?.notifications, newNotification];

    const update = {
      notifications: all_notification,
    };

    await UserModel.findByIdAndUpdate(userId, update);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const add_to_history = async ({
  userId,
  historyProps,
}: {
  userId: string;
  historyProps: historyProps;
}) => {
  try {
    const user = (await UserModel.findById(
      userId
    )) as userProps<beneficiariesProps>;

    const updateHistory = user.history.push(historyProps);

    const res = await UserModel.findByIdAndUpdate(userId, {
      history: updateHistory,
    });
    Promise.resolve(res);
  } catch (error) {
    console.log(error);
    Promise.reject(error);
  }
};
export const updateBalance = async ({
  userId,
  newBalance,
}: {
  userId: string;
  newBalance: number;
}) => {
  try {
    const res = await UserModel.findByIdAndUpdate(userId, {
      balance: newBalance,
    });
    Promise.resolve(res);
  } catch (error) {
    Promise.reject(error);
  }
};

export const getUserDetailsWithBVN = async () => {
  //
};
