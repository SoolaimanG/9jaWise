import { sendEmail } from "@/Functions/TS";
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

// Handle HTTP POST requests
export const POST = async (req: Request) => {
  const { target_amount, description, donation_name }: donationProps =
    await req.json();

  // Retrieve the user session using Next.js authentication
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unathorized (Please login to continue)",
    });
  }

  if (!target_amount) {
    return new Response(null, {
      status: 404,
      statusText: "Missing Parameter",
    });
  }

  await connectDatabase();

  try {
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(session.user.email as string)) ||
      (await findUserByPhoneNumber(session.user.email as string));

    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "User not found",
      });
    }

    if (!user.email && !user.emailVerified) {
      await closeConnection();
      return new Response(null, {
        status: 401,
        statusText: "Email needed for this operation",
      });
    }

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: 401,
        statusText: "Account is disabled",
      });
    }

    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Cannot perform this operation right now",
      });
    }

    if (!user.account.accountNumber) {
      await closeConnection();
      return new Response(null, {
        status: 401,
        statusText: "KYC not completed",
      });
    }

    const { donation_campaigns } = user;

    const ID = uuidv4();

    if (donation_campaigns.length >= 5) {
      await closeConnection();
      return new Response(null, {
        statusText: "Too many campaigns already exist",
        status: 429,
      });
    }
    const donation_link = `${process.env.HOSTNAME}/donate/${ID}`;

    const email = donation_campaign_email(donation_link);

    const new_donation: donationProps = {
      id: ID,
      created_by: user.username,
      amount_raised: 0,
      donation_name: donation_name,
      description: description,
      target_amount: target_amount,
      date: new Date(),
      donation_link: donation_link,
      donators: [],
      user_id: user._id.toString(),
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

    await Promise.all([
      UserModel.findByIdAndUpdate(user._id, updates),
      sendEmail({
        emailSubject: "New Donation Campaign Created",
        emailTemplate: email,
        emailTo: user.email as string,
      }),
    ]);

    // Close the database connection
    await closeConnection();

    return NextResponse.json({
      message: "New Campaign Created",
      link: donation_link,
    });
  } catch (error) {
    await closeConnection();
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};

// Handle HTTP PATCH requests
export const PATCH = async (req: Request) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Please login before accessing this page",
    });
  }

  const {}: donationProps = await req.json();
};

// Handle HTTP DELETE requests
export const DELETE = async (req: Request) => {
  // Your DELETE request handling code here
};
