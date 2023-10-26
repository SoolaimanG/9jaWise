import { inviteEmail } from "@/Emails/email";
import { countEmails, sendEmail } from "@/Functions/TS";
import { connectDatabase } from "@/Models";
import { inviteModel, inviteProps } from "@/Models/inviteUser";
import {
  beneficiariesProps,
  findUserByEmail,
  findUserById,
  findUserByPhoneNumber,
  userProps,
} from "@/Models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export const POST = async (req: Request) => {
  try {
    // Parse the request body for incoming data
    const { message, inviteeEmail }: inviteProps = await req.json();

    // Check for missing required fields
    if (!message || !inviteeEmail) {
      return new Response(null, {
        status: 400,
        statusText: "Bad Request: Missing Required Fields",
      });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized (Please Login)",
      });
    }

    const {
      user: { email },
    } = session;

    // Establish a database connection
    await connectDatabase();

    // Find the user by their ID
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    // Check if the user exists
    if (!user) {
      return new Response(null, {
        status: 404,
        statusText: "User Not Found",
      });
    }

    // Find email invitations sent by the user in the last 24 hours
    const findEmail: inviteProps[] | null = await inviteModel.find({
      inviterEmail: user.email,
      date: { $gte: 0 },
    });

    // Check if the user exceeded the invitation quota
    if (findEmail.length >= 3) {
      return new Response(null, {
        status: 429,
        statusText: "Too Many Invitations: Quota Exceeded",
      });
    }

    // Create a new invitation
    const newInvite = new inviteModel<inviteProps>({
      inviteeEmail: inviteeEmail,
      inviterEmail: user.email as string,
      date: new Date(),
      userId: user._id.toString(),
      message: message,
    });

    // Extract the friend's name from the invitee's email
    const friendName = inviteeEmail.split("@")[0];

    // Execute the following tasks in parallel
    await Promise.all([
      // Save the new invitation to the database
      newInvite.save(),
      // Send an email invitation to the invitee
      sendEmail({
        emailTemplate: inviteEmail({
          friendName,
          userName: user.username,
          phoneNumber: user.phoneNumber as string,
        }),
        emailSubject: "Invitation to Join 9jaWise",
        emailTo: inviteeEmail,
      }),
    ]);

    return new Response(null, {
      status: 201,
      statusText: "Invitation Sent Successfully",
    });
  } catch (error) {
    // Log any errors and return a 500 Internal Server Error response
    console.error(error);
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
