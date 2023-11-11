//----------------->All Imports<----------------
import { closeConnection, connectDatabase } from "@/Models";
import { otpProps } from "../../auth/requestOTP/route";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { HTTP_STATUS } from "../../donation/withdraw/route";

export const POST = async (req: Request) => {
  const { email, otp }: otpProps & { otp: string | number } = await req.json();

  if (!email && !otp) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing parameters",
    });
  }

  if (isNaN(Number(otp))) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Invalid OTP",
    });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized Please login",
    });
  }

  await connectDatabase();

  try {
    const user: userProps<beneficiariesProps> | null = await findUserByEmail(
      session?.user?.email as string
    );

    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "User not found",
      });
    }

    if (user.email !== email?.trim().toLowerCase()) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Email mismatch",
      });
    }

    if (user?.emailVerified) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Email already verified",
      });
    }

    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth/requestOTP?email=${user.email}&otp=${otp}`
    );

    if (!res.ok) {
      await closeConnection();
      return new Response(null, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    const new_notification: notificationsProps = {
      type: "info",
      time: Date.now(),
      message: "Your email has been verified successfully",
    };

    const update: userProps<beneficiariesProps> | {} = {
      notifications: [...user.notifications, new_notification],
      emailVerified: true,
    };

    await UserModel.findByIdAndUpdate(user._id, update);

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Email verification requested (Check Email)",
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
