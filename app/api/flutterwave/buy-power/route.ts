import { billPayment } from "@/Emails/email";
import { hashText, sendEmail } from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
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
import { v4 as uuidv4 } from "uuid";

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

  const session = await getServerSession(authOptions); //Get session from NEXT-AUTH to check if the user has login

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
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
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing required parameters",
    });
  }

  await connectDatabase(); //Establish connection with database

  try {
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
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
          status: HTTP_STATUS.CONFLICT,
          statusText: "Incorrect password",
        });
      }
    }

    //if the user balance is not enough to not allow
    if (user.balance < amount || user.balance <= 10) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText:
          "Something went wrong (Insufficient funds or amount to low)",
      });
    }

    if (user.balance < amount) {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Savings cannot be withdraw yet",
      });
    }

    const ref_id = uuidv4(); //Get a unique string as the ref_if of the transaction

    //Ready the history to update the user in DB ---->Transaction history
    const history_props: historyProps = {
      type: "bill payments",
      amount: amount,
      refID: ref_id,
      status: "complete",
      date: new Date().getTime(),
      name: "Electricity",
    };

    //User new notification
    const new_notification: notificationsProps = {
      type: "bill",
      billMessage: `You made a bill payment of ${amount} (POWER)`,
      time: Date.now(),
      transactionID: ref_id,
      amount: amount,
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

    //Email template for notify the user
    const email_template = billPayment({
      name: user.username,
      billAmount: amount,
      billType: "Bill",
      accounNumber: user.account.accountNumber as number,
      transaction_id: ref_id,
    });

    await UserModel.findByIdAndUpdate(user._id, updates).then(() => {
      sendEmail({
        emailSubject: "Bill Payment Successful",
        emailTemplate: email_template,
        emailTo: user.email as string,
      });
    }),
      await closeConnection();

    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Bill Payment Successful",
    });
  } catch (error) {
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
