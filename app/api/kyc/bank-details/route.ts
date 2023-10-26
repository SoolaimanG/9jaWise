import { accountNumberCreated } from "@/Emails/email";
import {
  countEmails,
  generateAccountNumber,
  get_static_account_number,
  hashText,
  random,
  regexTesting,
  sendEmail,
} from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserById,
  pushNotification,
  userProps,
} from "@/Models/user";
import { NextResponse } from "next/server";

export const PATCH = async (req: Request) => {
  // Extract the BVN from the request body
  const {
    bvn,
    email,
  }: {
    bvn: string;
    email?: string;
  } = await req.json();

  // Get the user's ID from request headers
  const _id = req.headers.get("user_id");
  const check_email = regexTesting("email", email as string);

  if (!bvn) {
    // Return a response if BVN is missing
    return new Response(null, {
      status: 403,
      statusText: "Missing BVN",
    });
  }

  if (email && !check_email) {
    return new Response(null, {
      status: 403,
      statusText: "Invalid Email",
    });
  }

  await connectDatabase();

  // Find the user by ID
  const findUser: userProps<beneficiariesProps> = await findUserById(
    _id as string
  );

  if (!findUser.email || !email) {
    // Close the database connection and return a response if email is required
    await closeConnection();
    return new Response(null, {
      status: 403,
      statusText: "Email is required for this operation",
    });
  }

  if (findUser.kyc_steps.length < 3) {
    // Close the database connection and return an unauthorized response if KYC steps are incomplete
    await closeConnection();
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  if (!findUser) {
    // Close the database connection and return a User Not Found response
    await closeConnection();
    return new Response(null, {
      status: 404,
      statusText: "User not found (Invalid ID)",
    });
  }

  if (bvn.length !== 11) {
    // Return a response for an invalid BVN number
    return new Response(null, {
      status: 403,
      statusText: "Invalid BVN number",
    });
  }

  if (Number.isNaN(bvn)) {
    // Return a response if BVN is not a valid number
    return new Response(null, {
      status: 403,
      statusText: "BVN is not a valid number",
    });
  }

  const salt = random(126);
  const hashBVN = hashText(salt, bvn);
  // TODO: Before hashing, generate an account number

  const [firstName, lastName] = findUser.fullName.split(" ");

  // Use this to generate an account number
  const accountNumber = await get_static_account_number({
    amount: 0,
    tx_ref: "",
    email: findUser.email || email,
    is_permanent: true,
    bvn: bvn,
    meta: {
      user_id: findUser._id.toString(),
      type: "fund_account",
    },
  });

  if (!accountNumber) {
    closeConnection();
    return new Response(null, {
      status: 400,
      statusText: "Something went wrong",
    });
  }

  // Check if the generated account number is already in use
  const findAccountNumber = await UserModel.findOne({
    accountNumber: accountNumber?.meta.authorization.transfer_account,
  });

  if (findAccountNumber) {
    // Close the database connection and return a response for a duplicate account number
    closeConnection();
    return new Response(null, {
      status: 429,
      statusText: "BVN already in use",
    });
  }

  const updateValues = {
    accountNumber: accountNumber?.meta.authorization.transfer_account,
    accountBank: accountNumber?.meta.authorization.transfer_bank,
    BVN: {
      bvnNumber: hashBVN,
      salt: salt,
    },
    KYC_completed: true,
  };

  const email_template = accountNumberCreated(
    accountNumber?.meta.authorization.transfer_account as number
  );

  try {
    await Promise.all([
      // Update the user's account with the new information
      UserModel.findOneAndUpdate({ _id }, updateValues),
      // Send an email notification to the user
      sendEmail({
        emailSubject: "New Account Number Created",
        emailTemplate: email_template,
        emailTo: findUser.email as string,
      }),
      // Push a notification to the user
      pushNotification(findUser._id.toString(), {
        message: `Your account number has been created ${accountNumber.meta.authorization.transfer_account}`,
        time: Date.now(),
        type: "info",
      }),
      // Count the emails sent for the user
      countEmails(_id as string, findUser.logs.totalEmailSent),
    ]);

    // Close the database connection
    closeConnection();

    // Return a success response
    return NextResponse.json({ data: accountNumber, message: "OK" });
  } catch (error) {
    // Return an error response in case of an exception
    return new Response(null, {
      status: 500,
      statusText: "Server error",
    });
  }
};
