import { closeConnection, connectDatabase } from "@/Models";
import { otpProps } from "../../auth/requestOTP/route";
import {
  UserModel,
  beneficiariesProps,
  findUserById,
  userProps,
} from "@/Models/user";

export const POST = async (req: Request) => {
  const { loginMode, email, otp }: otpProps & { otp: string | number } =
    await req.json();

  const _id = req.headers.get("user_id");

  if (!email && !otp && loginMode !== "email") {
    return new Response(null, {
      status: 404,
      statusText: "Missing parameters",
    });
  }

  if (!_id) {
    return new Response(null, {
      status: 404,
      statusText: "Missing parameters",
    });
  }

  const res = await fetch(
    `/api/auth/requestOTP?email_or_phoneNumber=email&otp=${otp}`
  );

  if (!res.ok) {
    return new Response(null, {
      status: res.status,
      statusText: res.statusText,
    });
  }

  await connectDatabase();

  try {
    const findUser: userProps<beneficiariesProps> | null = await findUserById(
      _id
    );

    if (!findUser) {
      return new Response(null, {
        status: 404,
        statusText: "User not found",
      });
    }

    if (findUser.emailVerified) {
      return new Response(null, {
        status: 400,
        statusText: "Email already verified",
      });
    }

    await UserModel.findByIdAndUpdate(findUser?._id.toString(), {
      emailVerified: true,
    });

    await closeConnection();
    return new Response(null, {
      status: 200,
      statusText: "Email Verified",
    });
  } catch (error) {
    console.log(error);
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
