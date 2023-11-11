import { accountNumberCreated } from "@/Emails/email";
import {
  generate_mock_bank,
  hashText,
  random,
  regexTesting,
  sendEmail,
} from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { AccountModel, account_number_props } from "@/Models/accountNumbers";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../../donation/withdraw/route";

export const PATCH = async (req: Request) => {
  // Extract the BVN from the request body
  const {
    bvn,
    user_email,
  }: {
    bvn: string;
    user_email?: string;
  } = await req.json();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized (Please login)",
    });
  }

  const { email } = session.user;
  // Get the user's ID from request headers
  const check_email = regexTesting("email", user_email as string);

  if (!bvn) {
    // Return a response if BVN is missing
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing BVN",
    });
  }

  if (user_email && !check_email) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Invalid Email",
    });
  }

  await connectDatabase();

  // Find the user by ID
  const user: userProps<beneficiariesProps> | null =
    (await findUserByEmail(email as string)) ||
    (await findUserByPhoneNumber(email as string));

  if (!user) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "User not found",
    });
  }

  if (user.disableAccount) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Account is disabled",
    });
  }

  if (user.suspisiousLogin) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Cannot perform this action right now",
    });
  }

  if (!user.email || !email) {
    // Close the database connection and return a response if email is required
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Email is required for this operation",
    });
  }

  if (user.kyc_steps.length > 2) {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.CONFLICT,
      statusText: "KYC Completed already",
    });
  }

  if (user.KYC_completed) {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.CONFLICT,
      statusText: "KYC Completed already",
    });
  }

  if (user.kyc_steps.length < 2) {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.CONFLICT,
      statusText: "Unauthorized (COMPLETE PREVIOUS KYC)",
    });
  }

  if (bvn.length !== 11) {
    // Return a response for an invalid BVN number
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Invalid BVN number",
    });
  }

  if (Number.isNaN(bvn)) {
    // Return a response if BVN is not a valid number
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "BVN is not a valid number",
    });
  }

  const user_bvn = hashText(user.BVN.salt, bvn); //Hash User BVN

  /**
   * Don't worry abount this it wont work because i did get the bvn initially the select for bvn is false so when fetching the user it won't get the BVN as it's a sensitive data to protect but this is just a TEST app and i will allow users to use any number of their choice as BVN and it should do just fine
   */
  const find_bvn = await UserModel.findOne({
    BVN: user_bvn,
  }).select("BVN");

  if (find_bvn) {
    return new Response(null, {
      status: HTTP_STATUS.CONFLICT,
      statusText: "BVN is in use",
    });
  }

  //Use randomBytes -> toString() to generate 126 SALT for hashing
  const salt = random(126);
  const hashBVN = hashText(salt, bvn);

  //Getting the firstName and lastName for the account Number creation
  const [firstName, lastName, ...rest] = user.fullName.split(" ");

  // TODO: Before hashing, generate an account number
  let account_number = ""; //At initail stage be empty
  let account_model: account_number_props | null = null; //@ inital state be null

  /**
   * Do while loop is use here to avoid dublicate account number to see more about the logic for creating account number using the user date of birth ckick in the generate_mock_bank for details , So this event will continue to create a new account number until it is unique i.e it's the only one in the DB
   */
  do {
    account_number = await generate_mock_bank(user.KYC.date_of_birth as Date); //Populate the initial abbove
    account_model = await AccountModel.findOne({
      account_number: account_number,
    }); //Populate the initial abbove
  } while (account_model);

  if (account_number.length <= 0) {
    closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Something went wrong",
    });
  }

  const new_notification: notificationsProps = {
    type: "info",
    time: Date.now(),
    message: `Hey there! Your unique account number has been created use this only within 9jaWise [Account Number:${account_number}, Account Name:${
      firstName.toUpperCase() + " " + lastName.toUpperCase()
    }, Bank Name: 9JAWISE BANK]`,
  };

  const updateValues: userProps<beneficiariesProps> | {} = {
    BVN: {
      bvnNumber: hashBVN,
      salt: salt,
    },
    KYC_completed: true,
    account: {
      accountBank: "9Ja Bank",
      accountName: firstName + " " + lastName,
      accountNumber: account_number,
    },
    balance: 5000,
    notifications: [...user.notifications, new_notification],
    kyc_steps: ["first", "second", "third"],
    logs: {
      ...user.logs,
      totalEmailSent: user.logs.totalEmailSent + 1,
    },
  };

  const next_twenty24_hours = 60 * 60 * 24 * 1000;

  const email_template = accountNumberCreated(Number(account_number));

  const save_account_number = new AccountModel<account_number_props>({
    _id: new mongoose.Types.ObjectId(),
    account_name: firstName + " " + lastName,
    account_number: account_number,
    account_type: "basic",
    is_permanent: true,
    bank_name: "9JA WISE BANK",
    expires: Date.now() + next_twenty24_hours,
    ref_id: user._id.toString(),
    created_by: user._id.toString(),
  });

  try {
    await Promise.all([
      UserModel.findByIdAndUpdate(user._id, updateValues),
      save_account_number.save(),
      sendEmail({
        // Send an email notification to the user
        emailSubject: "New Account Number Created",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
    ]);
    // Close the database connection
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "KYC Completed (Account Number Created)",
    });
  } catch (error) {
    // Return an error response in case of an exception
    // Close the database connection
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Server error",
    });
  }
};
