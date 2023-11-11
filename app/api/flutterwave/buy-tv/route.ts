//---------->All Imports<----------
import { billPayment } from "@/Emails/email";
import { hashText, random, sendEmail } from "@/Functions/TS";
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

export type buyTvProps = {
  biller_name: string;
  amount: number;
  card_number: number;
  otp?: string | number;
};

export const POST = async (req: Request) => {
  const { biller_name, amount, card_number, otp }: buyTvProps =
    await req.json();

  if (!biller_name && !amount && !card_number && !isNaN(Number(otp))) {
    return new Response(null, {
      status: 404,
      statusText: "Missing or Invalid required parameter",
    });
  }

  const session = await getServerSession(authOptions); //NEXTAUTH to get the current user session

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized (Please Login)",
    });
  }

  const {
    user: { email },
  } = session;

  await connectDatabase(); //Connect to DB and all closeConnection is to close the database connection as the name implies

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

    if (user.disableAccount) {
      return new Response(null, {
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: "Account is disabled",
      });
    }

    if (user.suspisiousLogin) {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this action right now",
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
          status: HTTP_STATUS.CONFLICT,
          statusText: "Incorrect password",
        });
      }
    }

    if (user.balance < amount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Insufficient Balance",
      });
    }

    if (user.balance < amount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong (Cannot use savings)",
      });
    }

    const ref_id = random(10);

    //Notify the user with this email template
    const email_template = billPayment({
      name: "Tv",
      billAmount: amount,
      billType: "Bill",
      accounNumber: user.account.accountNumber as number,
      transaction_id: ref_id,
    });

    //---> New transaction history
    const history_props: historyProps = {
      type: "bill payments",
      amount: amount,
      refID: ref_id,
      status: "complete",
      date: Date.now(),
      name: "TV",
    };

    //--->New notification
    const new_notification: notificationsProps = {
      type: "bill",
      billMessage: `You make a bill payment of ${amount} (TV)`,
      amount: amount,
      time: Date.now(),
      transactionID: ref_id,
    };

    //User updates --->
    const update: userProps<beneficiariesProps> | {} = {
      history: [...user.history, history_props],
      balance: user.balance - amount,
      notifications: [...user.notifications, new_notification],
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
        lastTransaction: {
          type: "debit",
          amount: amount,
        },
      },
    };

    await UserModel.findByIdAndUpdate(user._id.toString(), update),
      sendEmail({
        emailSubject: "Payment For Tv Completed",
        emailTemplate: email_template,
        emailTo: user.email as string,
      });

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Payment Successful",
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
