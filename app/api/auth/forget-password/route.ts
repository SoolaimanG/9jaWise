import { reset_password_email } from "@/Emails/email";
import { sendEmail } from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import { changePassword, changePasswordSchema } from "@/Models/changePassword";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  userProps,
} from "@/Models/user";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../../donation/withdraw/route";

export const POST = async (req: Request) => {
  const { loginID }: { loginID: string } = await req.json();

  if (!loginID) {
    return new Response(null, {
      status: 404,
      statusText: "Missing Parameter (Email or Password)",
    });
  }

  await connectDatabase();

  const user: userProps<beneficiariesProps> | null =
    (await findUserByEmail(loginID.toLowerCase())) ||
    (await findUserByPhoneNumber(loginID.toLowerCase()));

  if (!user) {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "User not found",
    });
  }

  if (user.disableAccount) {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Your account has been disabled",
    });
  }

  if (user.loginMode === "phoneNumber") {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText:
        "Cannot send login link to Phone Number at the moment (Please contact support Soolaimangee@gmail.com)",
    });
  }

  if (user.loginType === "otp") {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.CONFLICT,
      statusText: "Conflict this is not your authentication flow",
    });
  }

  const updates: userProps<beneficiariesProps> | {} = {
    authentication: {
      ...user.authentication,
      request_password_reset: true,
    },
    logs: {
      ...user.logs,
      totalEmailSent: user.logs.totalEmailSent + 1,
    },
  };

  const _ID = new mongoose.Types.ObjectId();

  const email_template = reset_password_email(
    `${process.env.NEXTAUTH_URL}/auth/change-password/${_ID.toString()}`
  );

  const expiry_time = 15 * 60 + Date.now();

  const changePassword = new changePasswordSchema<changePassword>({
    _id: _ID,
    user_id: user._id.toString(),
    loginID: loginID,
    status: "requested",
    expireOn: expiry_time,
  });

  try {
    await Promise.all([
      changePassword.save(),
      UserModel.findByIdAndUpdate(user._id.toString(), updates),
      sendEmail({
        emailSubject: "Reset your password",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
    ]);

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "An Email has been sent to you with instructions",
    });
  } catch (error) {
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Interval Server Error",
    });
  }
};
