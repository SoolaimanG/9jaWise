import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  historyProps,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { closeConnection, connectDatabase } from "@/Models";
import { hashText, sendEmail, user_with_password } from "@/Functions/TS";
import { transaction_alert_email } from "@/Emails/email";
import { DonationModel, donationProps } from "@/Models/donation";
import { v4 as uuidv4 } from "uuid";

// Enum for HTTP status codes
export enum HTTP_STATUS {
  OK = 200,
  BAD = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  CONFLICT = 409,
  TOO_MANY = 429,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

// PATCH method for handling donation withdrawals
export const PATCH = async (req: Request) => {
  // Destructure request payload
  const {
    withdraw_amount,
    donation_id,
    password_or_otp,
  }: { withdraw_amount: number; donation_id: string; password_or_otp: string } =
    await req.json();

  // Check for missing donation ID
  if (!donation_id) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing Parameters (Donation ID)",
    });
  }

  // Check for invalid or non-positive withdrawal amount
  if (isNaN(Number(withdraw_amount)) && withdraw_amount <= 0) {
    return new Response(null, {
      statusText: "Something went wrong",
      status: HTTP_STATUS.BAD,
    });
  }

  // Ensure a positive amount is used for withdrawal
  const amount = Math.abs(withdraw_amount);

  // Check for missing amount
  if (!amount) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Missing Parameters (Amount)",
    });
  }

  // Get the user session using NextAuth
  const session = await getServerSession(authOptions);

  // Check for an active user session
  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized Please Login",
    });
  }

  // Extract user email from the session
  const { email } = session.user;

  // Connect to the database
  await connectDatabase();

  try {
    // Find the user by email or phone number
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    // Check if user exists
    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "User not found",
      });
    }

    // Destructure user properties
    const {
      suspisiousLogin,
      disableAccount,
      balance,
      _id,
      settings: { send_otp_for_each_transaction },
      logs: { totalEmailSent },
      loginMode,
      loginType,
      notifications,
      history,
      account: { accountNumber },
    } = user;

    // Check for suspicious login
    if (suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this operation right now",
      });
    }

    // Check if the account is disabled
    if (disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Account is disabled",
      });
    }

    // Handle OTP verification or password check based on user settings
    if (send_otp_for_each_transaction) {
      if (loginMode === "email" && loginType === "otp") {
        // Perform OTP verification via an API request
        const res = await fetch(
          `${process.env.NEXTAUTH_URL}/api/auth/requestOTP?otp=${password_or_otp}&email=${user.email}`
        );

        // Check if OTP verification is successful
        if (!res.ok) {
          return new Response(null, {
            status: res.status,
            statusText: res.statusText,
          });
        }
      }

      // Password check for loginType "password"
      if (loginType === "password") {
        const user_password = await user_with_password(
          _id.toString(),
          user.loginMode === "email" ? "email" : "phoneNumber"
        );

        const hash_password = hashText(user_password.authentication.salt, "");

        if (hash_password !== user_password.authentication.password) {
          return new Response(null, {
            status: HTTP_STATUS.BAD,
            statusText: "Incorrect password",
          });
        }
      }

      // Conflict for loginMode "phoneNumber" and loginType "otp"
      if (loginMode === "phoneNumber" && loginType === "otp") {
        return new Response(null, {
          status: HTTP_STATUS.CONFLICT,
          statusText: "Cannot send OTP to phone number right now",
        });
      }
    }

    // Find the donation by ID
    const donation: donationProps | null = await DonationModel.findById(
      donation_id
    );

    // Check if the donation exists
    if (!donation) {
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "Donation not found",
      });
    }

    // Destructure donation properties
    const { amount_raised } = donation;

    // Check if the withdrawal amount is greater than the available amount in the donation
    if (amount_raised < amount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Insufficient amount",
      });
    }

    // Update donation and user information after successful withdrawal
    const donation_update: donationProps | {} = {
      amount_raised: amount_raised - amount,
    };

    const new_notification: notificationsProps = {
      time: Date.now(),
      type: "credit",
      amount: amount,
      header: "Payment received from donation",
    };

    const transaction_ref = uuidv4();

    const new_history: historyProps = {
      type: "credit",
      refID: transaction_ref,
      amount: amount,
      status: "complete",
      date: Date.now(),
      name: user.username,
    };

    // Email template for credit alert
    const credit_alert_email = transaction_alert_email({
      username: user.username,
      transaction_id: transaction_ref,
      account_number: String(accountNumber),
      amount: amount,
      date: new Date(),
      type: "credit",
    });

    // Updates for the user document
    const updates: userProps<beneficiariesProps> | {} = {
      balance: balance + amount,
      logs: {
        ...user.logs,
        totalEmailSent: totalEmailSent + 1,
        lastTransaction: {
          tran_type: "credit",
          amount: amount,
        },
      },
      notifications: [...notifications, new_notification],
      history: [...history, new_history],
    };

    // Perform atomic updates using Promise.all
    await Promise.all([
      UserModel.findByIdAndUpdate(user._id, updates),
      DonationModel.findByIdAndUpdate(donation_id, donation_update),
    ]).then(() => {
      // Send credit alert email
      sendEmail({
        emailSubject: "Credit Alert",
        emailTemplate: credit_alert_email,
        emailTo: user.email as string,
      });
    });

    // Close the database connection and return success response
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Amount withdrawn successfully",
    });
  } catch (error) {
    // Handle errors, log, close the connection, and return a server error response
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
