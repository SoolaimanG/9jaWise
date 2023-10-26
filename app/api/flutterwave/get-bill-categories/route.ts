import { NextResponse } from "next/server";
import { NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export const GET = async (req: Request) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unathorized (Please Login).",
    });
  }

  try {
    const res = await fetch("https://api.flutterwave.com/v3/bill-categories", {
      headers: {
        Authorization: process.env.FLW_SECRET_KEY as string,
      },
    });

    if (!res.ok) {
      return new Response(null, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    const data = await res.json();

    return NextResponse.json(data.data);
  } catch (error) {
    console.log(error);
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
