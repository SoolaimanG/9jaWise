import { getServerSession } from "next-auth";
import { HTTP_STATUS } from "../../donation/withdraw/route";
import { authOptions } from "../../auth/[...nextauth]/options";
import { closeConnection, connectDatabase } from "@/Models";
import { hashText, regexTesting, user_with_password } from "@/Functions/TS";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";

export const PATCH = async (req: Request) => {
  // Destructure the request data
  const {
    password,
    confirm_password,
    previous_password,
  }: { password: string; confirm_password: string; previous_password: string } =
    await req.json();

  // Check if required parameters are missing
  if (!password || !confirm_password || !previous_password) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing required parameters",
    });
  }

  // Check if the password meets requirements using a regex test
  const check_password = regexTesting("password", password);
  if (!check_password) {
    return new Response(null, {
      status: HTTP_STATUS.CONFLICT,
      statusText: "Password does not meet requirements",
    });
  }

  // Check if the password and confirm_password match
  if (password.trim().toLowerCase() !== confirm_password.trim().toLowerCase()) {
    return new Response(null, {
      status: HTTP_STATUS.CONFLICT,
      statusText: "Password does not match",
    });
  }

  // Retrieve the user's session
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized Please Login",
    });
  }

  const { email } = session.user;

  // Connect to the database
  await connectDatabase();

  try {
    // Find the user by email or phone number
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

    // Extract relevant user properties
    const { loginMode, suspisiousLogin, disableAccount, notifications, _id } =
      user;

    if (suspisiousLogin || disableAccount) {
      // Check for suspicious login or disabled account
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong",
      });
    }

    // Determine user_id based on login mode
    const user_id =
      loginMode === "email"
        ? (user.email as string)
        : (user.phoneNumber as string);

    // Retrieve the user's password information
    const user_password = await user_with_password(user_id, loginMode);

    // Extract the salt and hash the new password
    const {
      authentication: { salt },
    } = user_password;
    const hashPassword = hashText(salt, password);
    const hashPassword2 = hashText(salt, previous_password);

    if (hashPassword2 !== user_password.authentication.password) {
      // Check if the previous password matches
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Incorrect password",
      });
    }

    if (hashPassword === user_password.authentication.previous_password) {
      // Check for similarity to previous password
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "You have use this password in the past",
      });
    }

    if (hashPassword === user_password.authentication.password) {
      // Check if the new password is the same as the old one
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Use a different password",
      });
    }

    // Create a notification about the password change
    const new_notification: notificationsProps = {
      time: Date.now(),
      type: "info",
      message: "Your password has been changed",
    };

    // Prepare the update for the user
    const update: userProps<beneficiariesProps> | {} = {
      authentication: {
        ...user_password.authentication,
        password: hashPassword,
        previous_password: user_password.authentication.password,
      },
      notifications: [...notifications, new_notification],
    };

    // Update the user's password in the database
    await UserModel.findByIdAndUpdate(_id, update);

    // Close the database connection
    await closeConnection();

    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Password updated successfully",
    });
  } catch (error) {
    // Handle any potential errors
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
