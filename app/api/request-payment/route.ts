import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { closeConnection, connectDatabase } from "@/Models";
import { sendEmail } from "@/Functions/TS";
import { request_payment_email } from "@/Emails/email";
import { HTTP_STATUS } from "../donation/withdraw/route";

type requestPaymentTypes = {
  id: string;
  amount: number | string;
};

export const POST = async (req: Request) => {
  const { id, amount }: requestPaymentTypes = await req.json();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized (Please Login)",
    });
  }

  const {
    user: { email },
  } = session;

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

    if (
      String(user.account.accountNumber) === id ||
      user.email === id ||
      user.username === id
    ) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot request money from yourself",
      });
    }

    const {
      disableAccount,
      suspisiousLogin,
      account,
      kyc_steps,
      KYC_completed,
    } = user;

    if (disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: "Account is disabled",
      });
    }

    if (suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot Perform This Action Right Now",
      });
    }

    if (kyc_steps.length < 3 && !account.accountNumber && !KYC_completed) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.FORBIDDEN,
        statusText: "Complete KYC and proceed",
      });
    }

    const user_to_request: userProps<beneficiariesProps> | null =
      (await findUserByEmail(id)) ||
      (await UserModel.findOne({ username: id })) ||
      (await UserModel.findOne({ "account.accountNumber": id }));

    if (!user_to_request) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: `Cannot find user ${id}`,
      });
    }

    if (user_to_request.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: `${id} account has been disabled`,
      });
    }

    if (
      !user_to_request.account.accountNumber &&
      !user_to_request.KYC_completed &&
      user_to_request.kyc_steps.length < 3
    ) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: `${id} has not completed KYC`,
      });
    }

    const email_template = request_payment_email(
      user_to_request.username,
      user.username,
      Number(amount),
      {
        account_name: account.accountName as string,
        account_number: String(account.accountNumber),
        bank_name: account.accountBank as string,
      }
    );

    const user_request_notification: notificationsProps = {
      time: Date.now(),
      type: "info",
      message: `Hello ${user_to_request.username}, ${
        user.username
      } just request a payment of ${Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
      }).format(amount as number)} from you.`,
    };

    const user_notification: notificationsProps = {
      time: Date.now(),
      type: "info",
      message: `You just requested a payment of ${Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
      }).format(amount as number)} from ${user_to_request.username}.`,
    };

    const request_user_updates: userProps<beneficiariesProps> | {} = {
      notifications: [
        ...user_to_request.notifications,
        user_request_notification,
      ],
    };

    const user_updates: userProps<beneficiariesProps> | {} = {
      notifications: [...user.notifications, user_notification],
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
      },
    };

    await UserModel.findByIdAndUpdate(
      user_to_request._id,
      request_user_updates
    ).then(async () => {
      await UserModel.findByIdAndUpdate(user._id, user_updates);
      await sendEmail({
        emailSubject: "Money Requested",
        emailTemplate: email_template,
        emailTo: user_to_request.email as string,
      });
    });

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Request Sent Successfully",
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
