// Import necessary modules
import { airtimePurchased } from "@/Emails/email";
import { hashText, random, regexTesting, sendEmail } from "@/Functions/TS";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByEmail_Password,
  findUserByPhoneNumber,
  findUserByPhoneNumber_Password,
  historyProps,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { closeConnection, connectDatabase } from "@/Models";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { HTTP_STATUS } from "../../donation/withdraw/route";

// Define an enum for BillType
export enum BillType {
  airtime = "AIRTIME",
  power = "POWER",
  cable = "CABLE",
}

// Define the POST request handler
export const POST = async (req: Request) => {
  try {
    // Extract data from the request body
    const {
      amount,
      phone_number,
      network,
      otp_or_password,
    }: {
      amount: string;
      phone_number: string;
      network: "MTN" | "AIRTEL" | "9MOBILE" | "GLO";
      otp_or_password: string | number;
    } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(null, {
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: "Unauthorized (Please login)",
      });
    }

    const {
      user: { email },
    } = session;

    // Input Validation
    if (
      isNaN(Number(amount)) ||
      !phone_number ||
      !["MTN", "AIRTEL", "9MOBILE", "GLO"].includes(network)
    ) {
      // Return a Bad Request response if input parameters are invalid
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Invalid parameters",
      });
    }

    // Connect to the database
    await connectDatabase();

    // Find the user by email or phone number
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    if (!user) {
      // Close the database connection and return a User Not Found response
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "User not found",
      });
    }

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Account is disabled",
      });
    }

    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this action right now",
      });
    }

    if (user.emailVerified) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Verify email and proceed",
      });
    }

    if (!user.account.accountNumber) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Complete KYC and proceed",
      });
    }

    if (
      user.settings.send_otp_for_each_transaction &&
      user.loginType === "otp"
    ) {
      const res = await fetch(
        `${process.env.HOSTNAME}/auth/requestOTP?otp=${otp_or_password}&email=${user.email}`
      );

      if (!res.ok) {
        await closeConnection();
        return new Response(null, {
          status: res.status,
          statusText: res.statusText,
        });
      }
    }

    if (
      user.settings.send_otp_for_each_transaction &&
      user.loginType === "password"
    ) {
      const checkPassword = regexTesting("password", otp_or_password as string);

      if (!checkPassword) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.CONFLICT,
          statusText: "Incorrect Password",
        });
      }

      const user_password: userProps<beneficiariesProps> =
        user.loginMode === "email"
          ? await findUserByEmail_Password(user.email as string)
          : await findUserByPhoneNumber_Password(user.phoneNumber as string);

      const hashPassword = hashText(
        user_password.authentication.salt,
        otp_or_password as string
      );

      if (hashPassword !== user_password.authentication.salt) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.CONFLICT,
          statusText: "Incorrect Password",
        });
      }
    }

    //If the user balance is not up to amount then do not allow
    if (user.balance < Number(amount)) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Insufficient balance",
      });
    }

    // Check if user's savings can cover the amount
    if (user.balance < Number(amount)) {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong (Cannot use savings funds)",
      });
    }

    const REF_ID = random(10);

    // Prepare options for the bill
    const options = {
      country: "NG",
      type: BillType.airtime,
      customer: phone_number,
      amount: String(amount),
      recurrence: "ONCE",
      reference: REF_ID,
    };

    // Generate an email for the airtime purchase
    const email_template = airtimePurchased({
      phone_number: phone_number,
      amount: amount,
      time: new Date(),
    });

    const history: historyProps = {
      type: "airtime",
      amount: Number(amount),
      refID: REF_ID,
      status: "complete",
      date: Date.now(),
      name: phone_number,
    };

    const new_notification: notificationsProps = {
      time: Date.now(),
      type: "airtime",
      amount: Number(amount),
      isRead: false,
      transactionID: REF_ID,
      header: "Airtime Purchase Successful",
      billMessage: `${network} Airtime Purchase for ${phone_number} successfully`,
    };

    const updates: userProps<beneficiariesProps> | {} = {
      history: [...user.history, history],
      balance: user.balance - Number(amount),
      notifications: [...user.notifications, new_notification],
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
        lastTransaction: {
          tran_type: "debit",
          amount: Number(amount),
        },
      },
    };

    // Execute a series of asynchronous actions
    await UserModel.findByIdAndUpdate(user._id.toString(), updates).then(() => {
      // Send an email to the user
      sendEmail({
        emailSubject: "Airtime Purchase successful",
        emailTemplate: email_template,
        emailTo: user.email as string,
      });
    });

    // Close the database connection
    await closeConnection();

    // Return a successful response
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: `Airtime purchased for ${phone_number}: ${network}`,
    });
  } catch (error) {
    await closeConnection();
    // Log and return an Internal Server Error response in case of an exception
    console.error(error);
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
