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

export const GET = async (req: Request) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const { user } = session;

  console.log(user);

  try {
    await connectDatabase();

    const findUser: userProps<beneficiariesProps> | null =
      (await findUserByEmail(user?.email as string)) ||
      (await findUserByPhoneNumber(user?.email as string));

    if (findUser?.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: 403,
        statusText: "Account disabled",
      });
    }

    return NextResponse.json({ data: findUser });
  } catch (error) {
    return new Response(null, {
      status: 500,
      statusText: "Server Error",
    });
  }
};
