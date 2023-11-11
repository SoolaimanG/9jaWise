import { savingProps } from "@/provider";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByEmail_Password,
  findUserByPhoneNumber,
  findUserByPhoneNumber_Password,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { deletedBucket, savingBucketEmail } from "@/Emails/email";
import { hashText, sendEmail } from "@/Functions/TS";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../donation/withdraw/route";

// Handle HTTP POST requests
export const POST = async (req: Request) => {
  // Parse the incoming JSON data from the request
  const {
    _id,
    icon_name,
    amount,
    date,
    description,
    allow_withdraw,
    withdraw_with_password,
    name,
  }: savingProps = await req.json();

  // Retrieve the user session using Next.js authentication
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Authentication required",
    });
  }

  // Extract the user's email from the session
  const {
    user: { email },
  } = session;

  // Connect to the database
  await connectDatabase();

  try {
    // Find the user by email or phone number
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    // Check if the user doesn't exist
    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "User not found",
      });
    }

    if (!user.email && !user.emailVerified) {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Verify your email address",
      });
    }

    //Check if the user login session is suspicious
    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this action right now",
      });
    }

    if (amount <= 10) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: `Cannot save ${amount} Naira`,
      });
    }

    // Find saving buckets by _id or name
    const findSaving_with_id = user.savings.find((save) => {
      return save._id === _id;
    });

    const findSaving_with_name = user.savings.find((save) => {
      return save.name.toLowerCase() === name.toLowerCase();
    });

    // Check if a saving bucket with the same _id or name already exists
    if (findSaving_with_id) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Saving bucket with this ID already exists",
      });
    }

    if (findSaving_with_name) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Saving bucket with this NAME already exists",
      });
    }

    // Check if there's not enough balance to save the specified amount
    if (Number(amount) > user.balance) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Not enough amount to save",
      });
    }

    // Check if there's not enough balance to save the specified amount
    if (user.balance < Number(amount)) {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Not enough amount to save",
      });
    }

    const ID = new mongoose.Types.ObjectId();

    // Create a new saving bucket
    const new_savings: savingProps = {
      _id: ID,
      icon_name: icon_name,
      amount: amount,
      date: date,
      allow_withdraw: allow_withdraw,
      name: name,
      description: description,
      withdraw_with_password: withdraw_with_password,
    };

    // Create a new notification for the user
    const new_notifications: notificationsProps = {
      type: "info",
      message: `New Saving Bucket Created`,
      time: Date.now(),
    };

    // Generate an email template for the saving bucket
    const email_template = savingBucketEmail({
      username: user.username,
      bucket_name: name,
      id: ID.toString(),
      target_amount: amount,
      date: new Date(),
    });

    // Prepare the updates for the user's data
    const updates = {
      savings: [...user.savings, new_savings],
      notifications: [...user.notifications, new_notifications],
      balance: user.balance - amount,
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
      },
    };

    // Perform multiple operations asynchronously
    await Promise.all([
      UserModel.findByIdAndUpdate(user._id.toString(), updates),
      sendEmail({
        emailSubject: "New Saving Bucket Created",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
    ]);

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Bucket Created Successfully",
    });
  } catch (error) {
    // Handle any errors here
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};

export const DELETE = async (req: Request) => {
  // Parse the incoming JSON data from the request
  const { id, password, otp }: { id: string; password?: string; otp?: string } =
    await req.json();

  // Retrieve the user session using Next.js authentication
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Authentication required",
    });
  }

  // Check if the 'id' is missing
  if (!id) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing ID",
    });
  }

  // Extract the user's email from the session
  const {
    user: { email },
  } = session;

  // Connect to the database
  await connectDatabase();

  try {
    // Find the user by email or phone number
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    // Check if the user doesn't exist
    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "User not found",
      });
    }

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Account is disabled",
      });
    }

    // Check if the user's account is marked as suspicious
    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this action right now",
      });
    }

    // Find the saving bucket by '_id'
    const saving = user.savings.find((save) => {
      return save._id.toString() === id;
    });

    // Check if the saving bucket doesn't exist
    if (!saving) {
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "Bucket not found",
      });
    }

    // Get the current time
    const current_time = Date.now();
    const saving_time = new Date(saving.date);

    // Check if withdrawal is not allowed and the scheduled date is in the future
    if (!saving.allow_withdraw && saving_time.getTime() > current_time) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Cannot withdraw savings right now",
      });
    }

    // Check if there are multiple savings and the saving requires a password
    if (saving.amount > 0 && saving.withdraw_with_password) {
      const user_with_password: userProps<beneficiariesProps> =
        (await findUserByEmail_Password(email as string)) ||
        (await findUserByPhoneNumber_Password(email as string));

      // Hash the provided password and check if it matches the stored password
      const hash_password = hashText(
        user_with_password.authentication.salt,
        password as string
      );

      if (
        user.loginType === "password" &&
        hash_password !== user_with_password.authentication.password
      ) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.CONFLICT,
          statusText: "Invalid Password",
        });
      }

      if (user.loginType === "otp" && user.loginMode === "email") {
        // Send an OTP request if the user's login mode is OTP via email
        const res = await fetch(
          `/api/requestOTP?otp=${otp}&email=${user.email}`
        );

        if (!res.ok) {
          await closeConnection();
          return new Response(null, {
            status: res.status,
            statusText: res.statusText,
          });
        }
      }
    }

    // Remove the saving bucket from the user's savings
    const remove_bucket = user.savings.filter((save) => {
      return save._id.toString() !== id;
    });

    // Create a new notification for the user
    const new_notifications: notificationsProps = {
      type: "info",
      message: `${saving.name} has been deleted from your saving bucket`,
      time: Date.now(),
    };

    // Prepare updates for the user's data
    const update = {
      balance: user.balance + saving.amount,
      savings: remove_bucket,
      notifications: [...user.notifications, new_notifications],
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
      },
    };

    // Generate an email template for the deleted saving bucket
    const email_template = deletedBucket(saving.name, user.username);

    // Perform multiple operations asynchronously
    await Promise.all([
      UserModel.findByIdAndUpdate(user._id.toString(), update),
      sendEmail({
        emailSubject: "Saving Bucket Deleted",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
    ]);

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Bucket Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    // Handle any errors here
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
