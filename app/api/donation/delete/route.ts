import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { closeConnection, connectDatabase } from "@/Models";
import { AccountModel } from "@/Models/accountNumbers";
import { sendEmail } from "@/Functions/TS";
import { delete_campaign_email } from "@/Emails/email";
import { HTTP_STATUS } from "../withdraw/route";
import { DonationModel, donationProps } from "@/Models/donation";

// DELETE Donation Campaign API
export const DELETE = async (req: Request) => {
  // Parse the request JSON to get the ID of the donation campaign to be deleted
  const { id } = await req.json();

  // Check if the ID is missing or invalid and return a 404 response if true
  if (!id) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Invalid ID",
    });
  }

  // Get the user's session using Next.js authentication
  const session = await getServerSession(authOptions);

  // Check if the user is not logged in and return a 401 response
  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized (Please Login)",
    });
  }

  // Extract the email from the user's session
  const { email } = session.user;

  // Connect to the database
  await connectDatabase();

  try {
    // Find the user by email or phone number
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    // Check if the user is not found and return a 404 response
    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "User not found",
      });
    }

    // Extract user properties for further checks
    const { suspisiousLogin, disableAccount, donation_campaigns, balance } =
      user;

    // Check if the user's account is disabled and return a 400 response
    if (disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.FORBIDDEN,
        statusText: "Account is disabled",
      });
    }

    // Check if there is suspicious login activity and return a 400 response
    if (suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this action right now",
      });
    }

    // Find the target donation campaign by ID
    const donation: donationProps | null = await DonationModel.findById(id);

    // Check if the target donation is not found and return a 404 response
    if (!donation) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "Donation not found",
      });
    }

    const {
      donation_name,
      amount_raised,
      donation_account: { account_number },
    } = donation;

    // Create a new notification about the campaign deletion
    const new_notifications: notificationsProps = {
      time: Date.now(),
      type: "info",
      message: `Your donation campaign with the name ${donation_name} has been deleted`,
    };

    // Create an email template for notification
    const email_template = delete_campaign_email(user.username);

    // Define updates for the user's properties
    const updates: userProps<beneficiariesProps> | {} = {
      balance: balance + amount_raised,
      notifications: [...user.notifications, new_notifications],
    };

    await Promise.all([
      UserModel.findByIdAndUpdate(user._id, updates),
      AccountModel.findOneAndDelete({
        account_number: account_number,
      }),
      DonationModel.findByIdAndDelete(id),
      sendEmail({
        emailSubject: "Donation Campaign Deleted",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
    ]);

    // Close the database connection
    await closeConnection();
    // Return a 200 response to indicate successful campaign deletion
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Campaign deleted",
    });
  } catch (error) {
    // Log and handle unexpected errors
    console.log(error);
    await closeConnection();

    //Return a 500 response for internal server error
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
