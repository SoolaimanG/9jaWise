//----------------->All Imports<--------------
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { HTTP_STATUS } from "../../donation/withdraw/route";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  userProps,
} from "@/Models/user";
import { AccountModel } from "@/Models/accountNumbers";

export const DELETE = async (req: Request) => {
  // Get the user's session using Next.js authentication (NextAuth)
  const session = await getServerSession(authOptions);

  // If there's no user session, return an unauthorized response
  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized Please Login",
    });
  }

  // Extract the user's email from the session
  const { email } = session.user;

  // Connect to the database
  await connectDatabase();

  try {
    // Find the user by email or phone number
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    // If the user doesn't exist, return a not found response
    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "User not found",
      });
    }

    const { _id, suspisiousLogin, disableAccount } = user;

    // Check for suspicious login or a disabled account
    if (suspisiousLogin || disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot delete account",
      });
    }

    // Delete the user by their ID and delete related AccountModel records
    await UserModel.findByIdAndDelete(_id).then(async () => {
      await AccountModel.deleteMany({ user_id: _id });
    });

    // Close the database connection
    await closeConnection();

    // Return a successful response
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Account Deleted Successfully",
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
