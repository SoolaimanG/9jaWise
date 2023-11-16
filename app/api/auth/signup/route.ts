// Import necessary modules and functions
import { accountCreated, verifyEmailAddress } from "@/Emails/email";
import { hashText, random, regexTesting, sendEmail } from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  createUser,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../../donation/withdraw/route";

// Define the structure of sign-up data
export type signUpProps = {
  loginMode: "otp" | "password";
  email: string;
  phoneNumber: string;
  occupation: string;
  fullName: string;
  password?: string;
  confirmPassword?: string;
  loginType: "email" | "phoneNumber";
  accountType: "personal" | "business";
  acceptTermsAndConditions: boolean;
};

// Define options for making API requests
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": process.env.PHONENUMBER_VERIFY as string,
    "X-RapidAPI-Host": "veriphone.p.rapidapi.com",
  },
};

// Function to verify a phone number
export const verifyPhoneNumber = async (phoneNumber: string) => {
  const convertToNumber = Number(phoneNumber);

  if (Number.isNaN(convertToNumber)) {
    // Return an error if the phone number format is invalid
    return {
      phone_valid: false,
      error: "Invalid phoneNumber format",
    };
  }

  const url = `https://veriphone.p.rapidapi.com/verify?phone=${convertToNumber}`;

  const response = await fetch(url, options);
  const result: {
    phone_valid: boolean;
    network: "mtn" | "airtel" | "glo" | "9mobile";
  } = await response.json();

  // Handle error
  if (response.ok) {
    return {
      phone_valid: result?.phone_valid,
      error: "",
      network: result?.network,
    };
  } else {
    return {
      phone_valid: false,
      error: "Unable to verify phoneNumber",
    };
  }
};

//ENUM as Constant
export enum images {
  male = "https://i.ibb.co/1qGLDnY/peeps-avatar-7-2.png",
  female = "https://i.ibb.co/6XQd7nx/peeps-avatar-8-1.png",
}

// Main function to handle sign-up requests
export const POST = async (req: Request) => {
  const {
    loginMode,
    email,
    password,
    confirmPassword,
    occupation,
    phoneNumber,
    loginType,
    acceptTermsAndConditions,
    accountType,
    fullName,
    otp,
  }: signUpProps & {
    otp: number | string;
  } = await req.json();

  // Split and validate full name
  const [firstname, lastname, ...rest] = fullName.trim().split(" ");

  if (firstname.length <= 0 && lastname.length <= 0) {
    return new Response(null, {
      status: 400,
      statusText: "Your fullname is required.",
    });
  }

  if (
    (loginType === "phoneNumber" && phoneNumber.length < 10) ||
    (loginType === "email" && email.length < 10)
  ) {
    return new Response(null, {
      status: 400,
      statusText:
        loginType === "email"
          ? "Please use a valid email address"
          : "Please use a valid ohone number",
    });
  }

  // Check if the email is valid using regexTesting
  const checkEmail = regexTesting("email", email as string);

  await connectDatabase();

  // Check if the user already exists
  const user: userProps<beneficiariesProps> | null =
    loginType === "email"
      ? await findUserByEmail(email.toLowerCase())
      : await findUserByPhoneNumber(phoneNumber.toLowerCase());

  // Generate backup codes
  const backupCode_i = random(12);
  const backupCode_ii = random(12);
  const backupCode_iii = random(12);

  if (user) {
    await closeConnection();
    return new Response(null, {
      status: 400,
      statusText: `User with this identifier already exists`,
    });
  }

  // Sign up with OTP
  if (loginMode === "otp" && loginType === "email") {
    // If the email is invalid, return a 403 Forbidden response
    if (!checkEmail) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Invalid Email Address",
      });
    }

    //Check is the OTP is not a number
    if (isNaN(Number(otp))) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Invalid OTP (Must be a number)",
      });
    }

    const res = await fetch(
      `${process.env.HOSTNAME}/api/auth/requestOTP?otp=${otp}&email=${email}`
    );

    if (!res.ok) {
      await closeConnection();
      return new Response(null, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    const user: userProps<beneficiariesProps> = {
      _id: new mongoose.Types.ObjectId(),
      email: email.trim().toLowerCase(),
      emailVerified: true,
      suspisiousLogin: false,
      username: firstname.toLowerCase(),
      fullName: firstname.toLowerCase() + " " + lastname.toLowerCase(),
      disableAccount: false,
      profileImage: images.male,
      savings: [],
      phoneNumber: phoneNumber,
      phoneNumberVerified: false,
      history: [],
      beneficiaries: [],
      ip_address: "",
      occupation: occupation?.toLowerCase(),
      acceptTermsAndConditions: acceptTermsAndConditions,
      balance: 0,
      loginMode: loginType,
      loginType: loginMode,
      settings: {
        hidebalance: false,
        send_otp_for_each_transaction: false,
        whitelist_ip: false,
        twoFactorAuthentication: false,
        disableTransfer: false,
      },
      backupCodes: {
        backupCode_i,
        backupCode_ii,
        backupCode_iii,
      },
      logs: {
        lastLogin: 0,
        lastTransaction: {
          tran_type: "credit",
          amount: 0,
        },
        totalEmailSent: loginType === "email" ? 1 : 0,
      },
      security_questions: {
        question: "",
        answer: "",
      },
      accountType: accountType,
      notifications: [],
      KYC: {
        gender: "male",
        address: {
          street_address: "",
          city: "",
          nationality: "",
          state: "",
          place_of_birth: "",
        },
        nextOfKin: {
          name: "",
          nok: "",
        },
        marital_status: "single",
        date_of_birth: null,
      },
      bulkAccountsCreated: [],
      BVN: {
        bvnNumber: null,
        salt: "",
      },
      KYC_completed: false,
      kyc_steps: [],
      authentication: {
        salt: "",
        password: "",
        previous_password: "",
        request_password_reset: false,
      },
      account: {
        accountBank: "",
        accountName: "",
        accountNumber: null,
      },
      loginAttempts: {
        count: 0,
        reason: "",
        ip_address: "",
        last_attempt: new Date(),
      },
      donation_campaigns: [],
    };

    // Create email templates
    const emailTemplate = accountCreated(email || phoneNumber);

    const new_user = new UserModel<userProps<beneficiariesProps>>({
      ...user,
    });

    // Create user if user passes all checks
    try {
      await new_user.save();
      await sendEmail({
        emailSubject: "Account Creation Successful",
        emailTemplate: emailTemplate,
        emailTo: email,
      });
      //await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.OK,
        statusText: "Account created successfully",
      });
    } catch (error) {
      console.log(error);
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.SERVER_ERROR,
        statusText: "Server error",
      });
    }
  }

  //*This has been prevented from the client-side already but if the user find there way throgth this should help a bit
  if (loginMode === "otp" && loginType === "phoneNumber") {
    await closeConnection();
    return new Response(null, {
      status: 500,
      statusText: "This is not yet supported. Thank you",
    });
  }

  // Sign up with Password
  if (loginMode === "password") {
    if (loginType === "email") {
      //Check the user email with a regular expression True ->Valid False ->Not Valid
      if (!checkEmail) {
        return new Response(null, {
          status: 400,
          statusText: "Invalid Email Address",
        });
      }
    }

    let is_phoneNumber_valid = false; //*This is only use because of scope issues
    if (loginType === "phoneNumber") {
      //*If the user wants to user phone number with password conbination then check if the phone number is a valid number
      const data = await verifyPhoneNumber(phoneNumber);

      is_phoneNumber_valid = data.phone_valid;
    }

    const password_strength = regexTesting("password", password as string);

    if (!password_strength) {
      return new Response(null, {
        status: 400,
        statusText:
          "Password must be at least 6 characters, contain special characters, contain numbers and both lower and upper case",
      });
    }

    if (password !== confirmPassword) {
      return new Response(null, {
        status: 403,
        statusText: "The passwords you entered do not match",
      });
    }

    // Generate salt and hash password
    const salt = random(126);
    const hashPassword = hashText(salt, password as string);

    const new_notification: notificationsProps = {
      type: "email",
      time: Date.now(),
      message: "Please verify your email address",
    };

    // Create user object
    const user: userProps<beneficiariesProps> = {
      _id: new mongoose.Types.ObjectId(),
      email: email.trim().toLowerCase(),
      emailVerified: false,
      suspisiousLogin: false,
      username: firstname.toLowerCase(),
      fullName: firstname.toLowerCase() + " " + lastname.toLowerCase(),
      disableAccount: false,
      profileImage: images.male,
      savings: [],
      phoneNumber: phoneNumber,
      phoneNumberVerified: is_phoneNumber_valid,
      history: [],
      beneficiaries: [],
      ip_address: "",
      occupation: occupation?.toLowerCase(),
      acceptTermsAndConditions: acceptTermsAndConditions,
      balance: 0,
      loginMode: loginType,
      loginType: loginMode,
      settings: {
        hidebalance: false,
        send_otp_for_each_transaction: false,
        whitelist_ip: false,
        twoFactorAuthentication: false,
        disableTransfer: false,
      },
      backupCodes: {
        backupCode_i,
        backupCode_ii,
        backupCode_iii,
      },
      logs: {
        lastLogin: 0,
        lastTransaction: {
          tran_type: "credit",
          amount: 0,
        },
        totalEmailSent: loginType === "email" ? 1 : 0,
      },
      security_questions: {
        question: "",
        answer: "",
      },
      accountType: accountType,
      notifications: loginType === "email" ? [new_notification] : [],
      KYC: {
        gender: "male",
        address: {
          street_address: "",
          city: "",
          nationality: "",
          state: "",
          place_of_birth: "",
        },
        nextOfKin: {
          name: "",
          nok: "",
        },
        marital_status: "single",
        date_of_birth: null,
      },
      bulkAccountsCreated: [],
      BVN: {
        bvnNumber: null,
        salt: "",
      },
      KYC_completed: false,
      kyc_steps: [],
      authentication: {
        salt: salt,
        password: hashPassword,
        previous_password: "",
        request_password_reset: false,
      },
      account: {
        accountBank: "",
        accountName: "",
        accountNumber: null,
      },
      loginAttempts: {
        count: 0,
        reason: "",
        ip_address: "",
        last_attempt: new Date(),
      },
      donation_campaigns: [],
    };

    // Create email templates
    const emailTemplate = accountCreated(email || phoneNumber);
    const verifyAccount = verifyEmailAddress(
      process.env.HOSTNAME! + "/auth" + "/verify-email"
    );

    // Create user if user passes all checks and save recovery phrases
    try {
      await createUser({
        userData: user,
      }).then(() => {
        sendEmail({
          emailSubject: "Account Created successfully",
          emailTemplate: emailTemplate,
          emailTo: email,
        }),
          sendEmail({
            emailSubject: "Verify your email account",
            emailTemplate: verifyAccount,
            emailTo: email,
          });
      });

      return new Response(null, {
        status: 200,
        statusText: "Account created successfully",
      });
    } catch (error) {
      console.error(error);
      return new Response(null, {
        status: 500,
        statusText: "Server error",
      });
    }
  }
};
