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

type requestPaymentTypes = {
  id: string;
  amount: number | string;
};

export const POST = async (req: Request) => {
  const { id, amount }: requestPaymentTypes = await req.json();

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

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: 401,
        statusText: "Account is disabled",
      });
    }

    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Cannot Perform This Action Right Now",
      });
    }

    const user_to_request: userProps<beneficiariesProps> | null =
      (await findUserByEmail(id)) ||
      (await UserModel.findOne({ username: id })) ||
      (await UserModel.findOne({ "account.account_number": id }));

    if (!user_to_request) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "User not found",
      });
    }

    if (user_to_request.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: `${id} account has been disabled`,
      });
    }

    const email_template = "";

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
      status: 200,
      statusText: "Request Sent Successfully",
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
