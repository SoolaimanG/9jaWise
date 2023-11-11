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

  if (!amount && isNaN(Number(amount)) && amount <= 0) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Something went wrong",
    });
  }

  if (donation_name && donation_name.length < 3) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Something went wrong",
    });
  }

  if (description && description.length < 20) {
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

    const {
      suspisiousLogin,
      disableAccount,
      donation_campaigns,
      notifications,
    } = user;

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

    const find_donation = donation_campaigns.find((donation) => {
      return donation.id === id;
    });

    if (!find_donation) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "Donation not found",
      });
    }

    const donation_date = new Date(find_donation.date).getTime();
    const current_time = Date.now();

    if (current_time > donation_date) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Campaign Already Expired",
      });
    }

    const new_donation = donation_campaigns.map((donation) => {
      return donation.id === id
        ? {
            ...donation,
            donation_name: donation_name || donation.donation_name,
            description: description || donation.description,
            target_amount: amount || donation.target_amount,
          }
        : { ...donation };
    });

    const new_notification: notificationsProps = {
      type: "info",
      time: Date.now(),
      message: `${find_donation.donation_name} has been edited.`,
    };

    const updates: userProps<beneficiariesProps> | {} = {
      donation_campaigns: new_donation,
      notifications: [...notifications, new_notification],
    };

    await UserModel.findByIdAndUpdate(user._id, updates);

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
