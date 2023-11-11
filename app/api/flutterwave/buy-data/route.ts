//------------>All Imports<-----------

import { billPayment } from "@/Emails/email";
import { hashText, random, sendEmail } from "@/Functions/TS";
import { connectDatabase, closeConnection } from "@/Models";
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
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { HTTP_STATUS } from "../../donation/withdraw/route";

export const POST = async (req: Response) => {
  try {
    // Parse request data
    const {
      biller_code,
      amount,
      number,
      otp,
    }: { amount: number; number: string; biller_code: string; otp?: string } =
      await req.json();

    const session = await getServerSession(authOptions); //NEXTAUTH [Getting the current user session]

    //This is if the user is not authenticated
    if (!session?.user) {
      return new Response(null, {
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: "Unauthorized (Please login)",
      });
    }

    const {
      user: { email },
    } = session;

    // Check if required data is provided
    if (!biller_code || !number) {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Bad Request",
      });
    }

    // Generate a random reference ID
    const REF_ID = random(10);

    // Connect to the database
    await connectDatabase();

    // Find the user by ID
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    //If the user is not found
    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "User not found",
      });
    }

    //When the user account is disable
    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Account is disabled",
      });
    }

    //User have'nt verify email address return
    if (!user.emailVerified) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.FORBIDDEN,
        statusText: "Verify your email address",
      });
    }

    if (!user.account.accountNumber) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Complete KYC and proceed",
      });
    }

    //when ths user login in and it's a suspious login do not allow operation
    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this action",
      });
    }

    //Perform this acction according to what the user set
    if (
      user.settings.send_otp_for_each_transaction &&
      user.loginType === "otp"
    ) {
      //Verify OTP HERE
      const res = await fetch(
        `${process.env.HOSTNAME}/auth/requestOTP?otp=${otp}&email=${user.email}`
      );

      //Resolve or Reject Here
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
      const user_with_password: userProps<beneficiariesProps> =
        user.loginMode === "email"
          ? await findUserByEmail_Password(user.email as string)
          : await findUserByPhoneNumber_Password(user.phoneNumber as string);

      const hashPassword = hashText(
        user_with_password.authentication.salt,
        otp as string
      );

      if (user_with_password.authentication.password !== hashPassword) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.CONFLICT,
          statusText: "Incorrect Password",
        });
      }
    }

    //Not transaction should be perform if the amount is like less than or is 10
    if (amount <= 10) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: `Cannot buy data of N${amount}`,
      });
    }

    // Check if the user has sufficient balance
    if (user.balance < amount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Insufficient funds",
      });
    }

    // Check if user's balance can cover the amount
    if (user.balance < amount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong (Cannot use savings funds)",
      });
    }

    //Create a new history -->Transaction history
    const history: historyProps = {
      type: "bill payments",
      amount: Number(amount),
      refID: REF_ID,
      status: "complete",
      date: Date.now(),
      name: "Data Payment",
    };

    //Create a new user notification
    const new_notification: notificationsProps = {
      type: "bill",
      billMessage: `Data purchase for ${number} is successfully`,
      time: Date.now(),
      isRead: false,
      amount: amount,
      transactionID: REF_ID,
    };

    // Create a payment confirmation email
    const email_template = billPayment({
      name: user.username,
      billAmount: amount,
      accounNumber: String(user.account.accountNumber),
      transaction_id: REF_ID,
      billType: "Data",
    });

    //updates for user properties in the DB
    const updates: userProps<beneficiariesProps> | {} = {
      history: [...user.history, history],
      notifications: [...user.notifications, new_notification],
      balance: user.balance - amount,
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
        lastTransaction: {
          type: "debit",
          amount: amount,
        },
      },
    };

    // Find the user in the data base and updates the with the new DB
    await UserModel.findByIdAndUpdate(user._id.toString(), updates).then(() => {
      sendEmail({
        //Send email using STMP transporter ---> NODEMAILER
        emailSubject: "Data purchase successful",
        emailTemplate: email_template,
        emailTo: user.email as string,
      });
    }),
      // Close the database connection
      await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Data Purchase Successful",
    });
  } catch (error) {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
