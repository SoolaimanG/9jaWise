import { billPayment } from "@/Emails/email";
import { countEmails, hashText, random, sendEmail } from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByEmail_Password,
  findUserById,
  findUserByPhoneNumber,
  findUserByPhoneNumber_Password,
  historyProps,
  notificationsProps,
  pushNotification,
  updateBalance,
  userProps,
} from "@/Models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export type powerProps = {
  company: string;
  paymentType: "prepaid" | "postpaid";
  amount: number;
  meter_number: number;
};

export const POST = async (req: Request) => {
  const {
    company,
    paymentType,
    amount,
    meter_number,
    otp,
  }: powerProps & { otp: string } = await req.json();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized (Please Login)",
    });
  }

  const {
    user: { email },
  } = session;

  if (
    !company &&
    (paymentType === "postpaid" || paymentType === "prepaid") &&
    !amount &&
    !meter_number
  ) {
    return new Response(null, {
      status: 404,
      statusText: "Missing required parameters",
    });
  }

  await connectDatabase();

  try {
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
        otp
      );

      if (user_with_password.authentication.password !== hashPassword) {
        await closeConnection();

        return new Response(null, {
          status: 429,
          statusText: "Incorrect password",
        });
      }
    }

    if (user.balance < amount || user.balance <= 10) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Insufficient Balance",
      });
    }

    const total_savings = user.savings.reduce((acc, cur) => {
      return acc + cur.amount;
    }, 0);

    if (user.balance - total_savings < amount) {
      return new Response(null, {
        status: 400,
        statusText: "Savings cannot be withdraw yet",
      });
    }

    const ID = random(20);

    const payload = {
      country: "NG",
      customer: meter_number,
      amount: amount,
      type: company,
      reference: ID,
    }; //TODO:add payload

    const history_props: historyProps = {
      type: "bill payments",
      amount: amount,
      refID: ID,
      status: "complete",
      date: new Date().getTime(),
      name: "Electricity",
    };

    const new_notification: notificationsProps = {
      type: "bill",
      billMessage: `You made a bill payment of ${amount} (POWER)`,
      time: Date.now(),
      transactionID: ID,
    };

    const updates: userProps<beneficiariesProps> | {} = {
      history: [...user.history, history_props],
      notifications: [...user.notifications, new_notification],
      balance: user.balance - amount,
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
        lastTransaction: {
          tran_type: "debit",
          amount: amount,
        },
      },
    };

    const email_template = billPayment({
      name: user.username,
      billAmount: amount,
      billType: "Bill",
      accounNumber: user.account.accountNumber as number,
      transaction_id: ID,
    });

    await fetch(`https://api.flutterwave.com/v3/bills`, {
      method: "POST",
      headers: {
        Authorization: String(process.env.FLW_SECRET_KEY),
      },
      body: JSON.stringify(payload),
    }).then(() => {
      UserModel.findByIdAndUpdate(user._id, updates),
        sendEmail({
          emailSubject: "Bill Payment Successful",
          emailTemplate: email_template,
          emailTo: user.email as string,
        });
    });

    await closeConnection();

    return new Response(null, {
      status: 200,
      statusText: "Bill Payment Successful",
    });
  } catch (error) {
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
