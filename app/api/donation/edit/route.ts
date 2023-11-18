import { closeConnection, connectDatabase } from "@/Models";
import { HTTP_STATUS } from "../withdraw/route";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { DonationModel, donationProps } from "@/Models/donation";

export const PATCH = async (req: Request) => {
  const {
    donation_name,
    description,
    amount,
    id,
  }: {
    donation_name: string;
    description: string;
    amount: number;
    id: string;
  } = await req.json();

  if (!amount && !isNaN(Number(amount)) && amount <= 0) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Something went wrong",
    });
  }

  if (!donation_name) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Something went wrong",
    });
  }

  if (!description) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Something went wrong",
    });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized Please Login",
    });
  }

  const { email } = session.user;

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

    const { suspisiousLogin, disableAccount, notifications } = user;

    if (suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perfrom this action right now",
      });
    }

    if (disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Account is disabled",
      });
    }

    const donation: donationProps | null = await DonationModel.findById(id);

    if (!donation) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "Not Found",
      });
    }

    const { date } = donation;

    const current_time = Date.now();
    const donation_date = new Date(date).getTime();

    if (current_time > donation_date) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Campaign Already Expired",
      });
    }

    const new_notification: notificationsProps = {
      type: "info",
      time: Date.now(),
      message: `${donation_name} has been edited.`,
    };
    const updates: userProps<beneficiariesProps> | {} = {
      notifications: [...notifications, new_notification],
    };

    const donation_update: donationProps | {} = {
      donation_name: donation_name,
      description: description,
      target_amount: amount,
    };

    await Promise.all([
      DonationModel.findByIdAndUpdate(id, donation_update),
      UserModel.findByIdAndUpdate(user._id, updates),
    ]);

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Campaign updated successfully",
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
