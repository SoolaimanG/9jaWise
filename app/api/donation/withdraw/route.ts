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
import {
  hashText,
  random,
  sendEmail,
  user_with_password,
} from "@/Functions/TS";
import { transaction_alert_email } from "@/Emails/email";

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

export const PATCH = async (req: Request) => {
  const {
    withdraw_amount,
    donation_id,
    password_or_otp,
  }: { withdraw_amount: number; donation_id: string; password_or_otp: string } =
    await req.json();

  if (!donation_id) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing Parameters (Donation ID)",
    });
  }

  if (isNaN(Number(withdraw_amount)) && withdraw_amount <= 0) {
    return new Response(null, {
      statusText: "Something went wrong",
      status: HTTP_STATUS.BAD,
    });
  }

  const amount = Math.abs(withdraw_amount);

  if (!amount) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Missing Parameters (Donation ID)",
    });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized Please Login",
    });
  }

  const { email } = session.user;

  await connectDatabase();

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

    const {
      suspisiousLogin,
      disableAccount,
      donation_campaigns,
      balance,
      _id: { id },
      settings: { send_otp_for_each_transaction },
      logs: { totalEmailSent },
      loginMode,
      loginType,
      notifications,
      history,
    } = user;

    if (suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this operation right now",
      });
    }

    if (disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Account is disabled",
      });
    }

    if (send_otp_for_each_transaction) {
      if (loginMode === "email" && loginType === "otp") {
        //
        const res = await fetch(
          `${process.env.NEXTAUTH_URL}/api/auth/requestOTP?otp=${password_or_otp}&email=${user.email}`
        );

        if (!res.ok) {
          return new Response(null, {
            status: res.status,
            statusText: res.statusText,
          });
        }
      }

      if (loginType === "password") {
        //
        const user_password = await user_with_password(
          id.toString(),
          user.loginMode === "email" ? "email" : "phone_number"
        );

        const hash_password = hashText(user_password.authentication.salt, "");

        if (hash_password !== user_password.authentication.password) {
          return new Response(null, {
            status: HTTP_STATUS.BAD,
            statusText: "Incorrect password",
          });
        }
      }

      if (loginMode === "phoneNumber" && loginType === "otp") {
        //
        return new Response(null, {
          status: HTTP_STATUS.CONFLICT,
          statusText: "Cannot send OTP to phone number right now",
        });
      }
    }

    const find_donation = donation_campaigns.find((donation) => {
      return donation.id === donation_id;
    });

    if (!find_donation) {
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "Donation not found",
      });
    }

    if (find_donation.amount_raised < amount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Insufficient amount",
      });
    }

    const new_donation_campaign = donation_campaigns.map((donation) => {
      return donation.id === donation_id
        ? { ...donation, amount_raised: donation.amount_raised - amount }
        : { ...donation };
    });

    const new_notification: notificationsProps = {
      time: Date.now(),
      type: "credit",
      amount: amount,
      header: "Payment recieved from donation",
    };

    const transaction_ref = random(25);

    const new_history: historyProps = {
      type: "credit",
      refID: transaction_ref,
      amount: amount,
      status: "complete",
      date: Date.now(),
      name: user.username,
    };

    const credit_alert_email = transaction_alert_email({
      username: user.username,
      transaction_id: transaction_ref,
      account_number: String(user.account.accountNumber),
      amount: amount,
      date: new Date(),
      type: "credit",
    });

    const updates: userProps<beneficiariesProps> | {} = {
      balance: balance + amount,
      donation_campaigns: new_donation_campaign,
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

    await UserModel.findByIdAndUpdate(user._id, updates).then(async () => {
      await sendEmail({
        emailSubject: "Credit Alert",
        emailTemplate: credit_alert_email,
        emailTo: user.email as string,
      });
    });

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Amount withdrawn successfully",
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
