import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./app/api/auth/[...nextauth]/options";

export async function middleware(req: NextRequest) {
  //
}
