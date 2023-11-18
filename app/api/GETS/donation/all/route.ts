import { closeConnection, connectDatabase } from "@/Models";
import { DonationModel, donationProps } from "@/Models/donation";
import {
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  userProps,
} from "@/Models/user";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { HTTP_STATUS } from "@/app/api/donation/withdraw/route";
import { getServerSession } from "next-auth";

export const GET = async (req: Request) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized please login",
    });
  }

  const { email } = session?.user;

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

    const { _id, suspisiousLogin, disableAccount } = user;

    if (disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "User account is banned",
      });
    }

    if (suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong",
      });
    }

    const donations: donationProps[] | [] = await DonationModel.find({
      user_id: _id.toString(),
    });

    await closeConnection();
    return Response.json({ donations: donations });
  } catch (error: any) {
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
