import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByEmail_Password,
  findUserByPhoneNumber,
  findUserByPhoneNumber_Password,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { hashText, sendEmail } from "@/Functions/TS";
import { withdrawFromBucket } from "@/Emails/email";
import { HTTP_STATUS } from "../../donation/withdraw/route";

//Withdraw HTTP @POST request
export const POST = async (req: Request) => {
  const {
    name,
    amount,
    password,
    otp,
  }: {
    name: string;
    amount: number;
    password?: string;
    otp?: string | number;
  } = await req.json();

  if (!name && !amount) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing Parameters",
    });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Authentication required",
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

    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this action right now",
      });
    }

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Account is disabled",
      });
    }

    const saving = user.savings.find((save) => {
      return save.name.trim().toLowerCase() === name.trim().toLowerCase();
    });

    if (!saving) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "Bucket does not exist",
      });
    }

    const current_time = Date.now();
    const saving_date = new Date(saving.date);

    if (!saving.allow_withdraw && saving_date.getTime() > current_time) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: `Cannot withdraw savings until ${saving.date.toISOString()}`,
      });
    }

    if (saving.amount < amount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Not enough bucket balance",
      });
    }

    if (saving.withdraw_with_password) {
      const user_with_password: userProps<beneficiariesProps> =
        (await findUserByEmail_Password(user.email as string)) ||
        (await findUserByPhoneNumber_Password(user.phoneNumber as string));

      if (user.loginType === "password") {
        const hash_password = hashText(
          user_with_password.authentication.salt,
          password as string
        );

        if (hash_password !== user.authentication.password) {
          await closeConnection();
          return new Response(null, {
            status: HTTP_STATUS.BAD,
            statusText: "Incorrect password",
          });
        }
      }

      if (user.loginType === "otp") {
        const res = await fetch(
          `/api/auth/requestOTP?otp=${otp}&email=${user.email}`
        );

        if (!res.ok) {
          await closeConnection();
          return new Response(null, {
            status: res.status,
            statusText: res.statusText,
          });
        }
      }
    }

    const all_savings = user.savings.map((save) => {
      return save._id === saving._id
        ? { ...save, amount: save.amount - Number(amount) }
        : { ...save };
    });

    const new_notifications: notificationsProps = {
      type: "warning",
      time: Date.now(),
      message: `${amount} has been withdrawn from ${saving.name} saving bucket`,
    };

    const email_template = withdrawFromBucket({
      username: user.username,
      bucket_name: saving.name,
      date: new Date().toISOString(),
      target_amount: amount,
    });

    const updates: userProps<beneficiariesProps> | {} = {
      balance: user.balance + Number(amount),
      savings: all_savings,
      notifications: [...user.notifications, new_notifications],
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
      },
    };

    await Promise.all([
      UserModel.findByIdAndUpdate(user._id.toString(), updates),
      sendEmail({
        emailSubject: "Withdraw successfull",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
    ]);

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Withdraw successfull",
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
