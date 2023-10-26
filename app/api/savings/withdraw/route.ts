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

//Withdraw HTTP @POST request
export const POST = async (req: Request) => {
  const {
    id,
    amount,
    password,
    otp,
  }: {
    id: string | number;
    amount: number;
    password?: string;
    otp?: string | number;
  } = await req.json();

  if (!id && !amount) {
    return new Response(null, {
      status: 404,
      statusText: "Missing Parameters",
    });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
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
        status: 404,
        statusText: "User not found",
      });
    }

    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: 403,
        statusText: "Cannot perform this action right now",
      });
    }

    const saving = user.savings.find((save) => {
      return save._id === id;
    });

    if (!saving) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "Bucket does not exist",
      });
    }

    if (saving.amount < amount) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Not enough bucket balance",
      });
    }

    const current_time = Date.now();

    if (!saving.allow_withdraw && saving.date.getTime() > current_time) {
      await closeConnection();
      return new Response(null, {
        status: 403,
        statusText: `Cannot withdraw savings until ${saving.date.toISOString()}`,
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
            status: 400,
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
            status: 400,
            statusText: "Invalid OTP",
          });
        }
      }
    }

    const all_savings = user.savings.map((save) => {
      return save._id === id
        ? { ...save, amount: save.amount - amount }
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
      status: 200,
      statusText: "Withdraw successfull",
    });
  } catch (error) {
    await closeConnection();
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
