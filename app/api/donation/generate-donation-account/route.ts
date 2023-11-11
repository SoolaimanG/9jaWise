import { generate_mock_bank, sendEmail } from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { donationProps } from "@/provider";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { donation_campaign_email } from "@/Emails/email";
import { v4 as uuidv4 } from "uuid";
import { AccountModel, account_number_props } from "@/Models/accountNumbers";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../withdraw/route";

// Handle HTTP POST requests
export const POST = async (req: Request) => {
  const { target_amount, description, donation_name, date }: donationProps =
    await req.json();

  // Retrieve the user session using Next.js authentication
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unathorized (Please login to continue)",
    });
  }

  if (!target_amount || !donation_name || !description) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing Parameter",
    });
  }

  await connectDatabase();

  const { email } = session.user;

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

    if (!user.email && !user.emailVerified) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: "Email needed for this operation",
      });
    }

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: "Account is disabled",
      });
    }

    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this operation right now",
      });
    }

    if (!user.account.accountNumber) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "KYC not completed",
      });
    }

    if (!user.KYC_completed) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "KYC not completed",
      });
    }

    const { donation_campaigns } = user;

    const ID = new mongoose.Types.ObjectId();

    if (donation_campaigns.length >= 5) {
      await closeConnection();
      return new Response(null, {
        statusText: "Too many campaigns already exist",
        status: HTTP_STATUS.TOO_MANY,
      });
    }

    const donation_link = `${process.env.HOSTNAME}/donate/${ID.toString()}`;

    const email_template = donation_campaign_email(donation_link);

    const current_time = Date.now();

    const donation_account = await generate_mock_bank(new Date(current_time));

    const donation_account_name = `${user.username} --donation-${
      user.donation_campaigns.length + 1
    }`;

    const new_donation: donationProps = {
      id: ID.toString(),
      created_by: user.username,
      amount_raised: 0,
      donation_name: donation_name,
      description: description,
      target_amount: target_amount,
      date: date,
      donation_link: donation_link,
      donators: [],
      donation_account: {
        account_name: donation_account_name,
        account_number: donation_account,
        bank_name: "9JA WISE",
      },
    };

    const new_notifications: notificationsProps = {
      time: Date.now(),
      type: "info",
      message: "A new donation campaign has been created",
    };

    const updates: userProps<beneficiariesProps> | {} = {
      donation_campaigns: [...user.donation_campaigns, new_donation],
      notifications: [...user.notifications, new_notifications],
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
      },
    };

    const account_number = new AccountModel<account_number_props>({
      _id: ID,
      account_number: donation_account,
      account_name: donation_account_name,
      bank_name: "9JA WISE",
      account_type: "donation",
      is_permanent: false,
      expires: new Date(date).getTime(),
      ref_id: user._id.toString(),
      created_by: user._id.toString(),
    });

    await Promise.all([
      UserModel.findByIdAndUpdate(user._id, updates),
      account_number.save(),
      sendEmail({
        emailSubject: "New Donation Campaign Created",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
    ]);

    // Close the database connection
    await closeConnection();

    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Donation campaign created successfully",
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
