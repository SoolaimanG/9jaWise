import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export const GET = async (req: Request) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized (Please Login)",
    });
  }

  const res = await fetch("https://api.paystack.co/bank", {
    headers: {
      Authorization: "Bearer" + String(process.env.FLW_SECRET_KEY),
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
};
