import { hashText, random, regexTesting, sendEmail } from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import { changePassword, changePasswordSchema } from "@/Models/changePassword";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail_Password,
  findUserById_Password,
  notificationsProps,
  userProps,
} from "@/Models/user";

export const POST = async (req: Request) => {
  const {
    password,
    confirmPassword,
    id,
  }: { password: string; confirmPassword: string; id: string } =
    await req.json();

  if (!password && !confirmPassword && !id) {
    return new Response(null, {
      status: 404,
      statusText: "Missing parameters (Password or Confirm Password)",
    });
  }

  const checkPassword = regexTesting("password", password);

  if (!checkPassword) {
    return new Response(null, {
      status: 403,
      statusText: "Weak password",
    });
  }

  if (password !== confirmPassword) {
    return new Response(null, {
      status: 429,
      statusText: "Passwords do not match",
    });
  }

  await connectDatabase();

  try {
    const password_change: changePassword | null =
      await changePasswordSchema.findById(id);

    if (!password_change) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText:
          "User did not request for password change (Request not found)",
      });
    }

    const current_time = Date.now();

    if (password_change.expireOn < current_time) {
      await closeConnection();
      return new Response(null, {
        status: 403,
        statusText: "Please request a new password change (TOKEN has expired).",
      });
    }

    const user: userProps<beneficiariesProps> | null =
      await findUserById_Password(password_change.user_id);

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
        status: 401,
        statusText: "Cannot change password at the moment",
      });
    }

    if (!user?.authentication.request_password_reset) {
      await closeConnection();

      return new Response(null, {
        status: 429,
        statusText: "Something went wrong (Conflict with request)",
      });
    }

    const user_with_password: userProps<beneficiariesProps> =
      await findUserByEmail_Password(user.email!);

    const hashPassword = hashText(user.authentication.salt, password);

    if (hashPassword === user_with_password.authentication.previous_password) {
      await closeConnection();
      return new Response(null, {
        status: 429,
        statusText:
          "This password is similar to your a previous password you have used before (Please try another password)",
      });
    }

    const new_notification: notificationsProps = {
      time: Date.now(),
      message: "Your password has been updated successfully",
      type: "info",
    };

    const updates: userProps<beneficiariesProps> | {} = {
      authentication: {
        request_password_reset: false,
        previous_password: user.authentication.password,
        password: hashPassword,
        salt: user.authentication.salt,
      },
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
      },
      notifications: [...user.notifications, new_notification],
    };

    const email_template = "";

    await closeConnection();
    await Promise.all([
      UserModel.findByIdAndUpdate(password_change.user_id, updates),
      sendEmail({
        emailSubject: "Your password has been changed",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
    ]);
  } catch (error) {
    await closeConnection();
    return new Response(null, {
      status: 400,
      statusText: "Internal Server Error",
    });
  }
};
