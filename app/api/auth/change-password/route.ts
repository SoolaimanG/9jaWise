import { hashText, regexTesting, sendEmail } from "@/Functions/TS";
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
import { HTTP_STATUS } from "../../donation/withdraw/route";

export const POST = async (req: Request) => {
  const {
    password,
    confirmPassword,
    id,
  }: { password: string; confirmPassword: string; id: string } =
    await req.json();

  if (!password && !confirmPassword && !id) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing parameters (Password or Confirm Password)",
    });
  }

  const checkPassword = regexTesting("password", password);

  if (!checkPassword) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Weak password",
    });
  }

  if (password.trim() !== confirmPassword.trim()) {
    return new Response(null, {
      status: HTTP_STATUS.CONFLICT,
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
        status: HTTP_STATUS.NOT_FOUND,
        statusText:
          "User did not request for password change (Request not found)",
      });
    }

    const current_time = Date.now();

    if (password_change.status === "changed") {
      await closeConnection();
      return new Response(null, {
        statusText: "Password has been changed already",
        status: HTTP_STATUS.CONFLICT,
      });
    }

    console.log(password_change);

    if (current_time > password_change.expireOn) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Request new token (TOKEN has expired).",
      });
    }

    const user: userProps<beneficiariesProps> | null =
      await findUserById_Password(password_change.user_id);

    if (!user) {
      await closeConnection();

      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "User not found",
      });
    }

    const {
      suspisiousLogin,
      authentication: { request_password_reset, salt },
    } = user;

    if (suspisiousLogin) {
      await closeConnection();

      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot change password at the moment",
      });
    }

    if (!request_password_reset) {
      await closeConnection();

      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "User did not request password reset",
      });
    }

    const user_with_password: userProps<beneficiariesProps> =
      await findUserByEmail_Password(user.email!);

    const hashPassword = hashText(
      user_with_password.authentication.salt,
      password.trim()
    );

    if (hashPassword === user_with_password.authentication.previous_password) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Something went wrong (Use different password)",
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
        previous_password: user_with_password.authentication.password,
        password: hashPassword,
        salt: user_with_password.authentication.salt,
      },
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
      },
      notifications: [...user.notifications, new_notification],
    };

    const password_update: changePassword | {} = {
      status: "changed",
    };

    const email_template = "";

    await closeConnection();
    await UserModel.findByIdAndUpdate(password_change.user_id, updates).then(
      async () => {
        changePasswordSchema.findByIdAndUpdate(
          password_change._id,
          password_update
        );
        sendEmail({
          emailSubject: "Your password has been changed",
          emailTemplate: email_template,
          emailTo: user.email as string,
        });
      }
    );

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Password Successfully Changed",
    });
  } catch (error) {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
