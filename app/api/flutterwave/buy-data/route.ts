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

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized (Please login)",
      });
    }

    const {
      user: { email },
    } = session;

    // Check if required data is provided
    if (!biller_code || !number) {
      return new Response(null, {
        status: 400,
        statusText: "Bad Request",
      });
    }

    // Generate a random reference ID
    const REF_ID = random(10);

    // Prepare payload for the payment request
    const payload = {
      country: "NG",
      customer: number,
      type: biller_code,
      amount: amount,
      reference: REF_ID,
    };

    // Connect to the database
    await connectDatabase();

    // Find the user by ID
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "User not found",
      });
    }

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Account is disabled",
      });
    }

    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Cannot perform this action",
      });
    }

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
          status: 401,
          statusText: "Incorrect Password",
        });
      }
    }

    if (amount <= 10) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: `Cannot buy data of N${amount}`,
      });
    }

    // Check if the user has sufficient balance
    if (user.balance < amount) {
      await closeConnection();
      return new Response(null, {
        status: 429,
        statusText: "Insufficient funds",
      });
    }

    // Calculate the total funds in savings buckets
    const totalBucketFunds = user.savings.reduce((acc, curr) => {
      return acc + curr.amount;
    }, 0);

    // Check if user's savings can cover the amount
    if (user.balance - totalBucketFunds < amount) {
      await closeConnection();
      return new Response(null, {
        status: 429,
        statusText: "Something went wrong (Cannot use savings funds)",
      });
    }

    const history: historyProps = {
      type: "bill payments",
      amount: Number(amount),
      refID: REF_ID,
      status: "complete",
      date: Date.now(),
      name: "Data Payment",
    };

    const new_notification: notificationsProps = {
      type: "bill",
      billMessage: "",
      time: Date.now(),
      isRead: false,
      amount: amount,
    };

    // Create a payment confirmation email
    const email_template = billPayment({
      name: user.username,
      billAmount: 0,
      accounNumber: String(user.account.accountNumber),
      transaction_id: REF_ID,
      billType: "Data",
    });

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

    // Perform necessary updates and notifications

    await fetch("https://api.flutterwave.com/v3/bills", {
      method: "POST",
      headers: {
        Authorization: String(process.env.FLW_SECRET_KEY),
      },
      body: JSON.stringify(payload),
    }).then(() => {
      UserModel.findByIdAndUpdate(user._id.toString(), updates),
        sendEmail({
          emailSubject: "Data purchase successful",
          emailTemplate: email_template,
          emailTo: user.email as string,
        });
    });

    // Close the database connection
    await closeConnection();

    return new Response(null, {
      status: 200,
      statusText: "Data Purchase Successful",
    });
  } catch (error) {
    await closeConnection();
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
