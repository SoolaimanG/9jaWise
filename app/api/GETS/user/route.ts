import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { closeConnection, connectDatabase } from "@/Models";
import {
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  userProps,
} from "@/Models/user";
import { HTTP_STATUS } from "../../donation/withdraw/route";

export const GET = async (req: Request) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
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

    if (user?.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.FORBIDDEN,
        statusText: "Account disabled",
      });
    }

    await closeConnection();
    return NextResponse.json({ data: user });
  } catch (error) {
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Server Error",
    });
  }
};
