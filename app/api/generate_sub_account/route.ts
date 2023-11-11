import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { closeConnection, connectDatabase } from "@/Models";
import { subaccountTypes } from "@/components/Account/subAccounts";
import { generate_mock_bank, regexTesting } from "@/Functions/TS";
import { v4 as uuidv4 } from "uuid";
import { AccountModel, account_number_props } from "@/Models/accountNumbers";
import mongoose from "mongoose";

export const POST = async (req: Request) => {
  const { amount_to_recieve, payers_email }: subaccountTypes = await req.json();

  if (amount_to_recieve <= 10) {
    return new Response(null, {
      status: 400,
      statusText: "Amount too low",
    });
  }

  const check_email = regexTesting("email", payers_email);

  if (!check_email) {
    return new Response(null, {
      status: 400,
      statusText: "Invalid email address",
    });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized (Please Login)",
    });
  }

  const { email } = session.user;

  try {
    await connectDatabase();

    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(email as string)) ||
      (await findUserByPhoneNumber(email as string));

    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "User not found",
      });
    }

    if (user.email?.toLowerCase() === payers_email.toLowerCase()) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Cannot create sub account for your self",
      });
    }

    if (!user.email || !user.emailVerified) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Verify your email address",
      });
    }

    if (!user.account.accountNumber) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Please complete KYC and proceed",
      });
    }

    if (!user.KYC_completed) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Please complete KYC and proceed",
      });
    }

    if (user.suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Cannot perform this action right now",
      });
    }

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: 401,
        statusText: "Account is disabled",
      });
    }

    const active_subaccounts = user.bulkAccountsCreated.filter((sub) => {
      return (sub.expires_at as number) > Date.now();
    });

    if (active_subaccounts.length >= 10) {
      await closeConnection();
      return new Response(null, {
        status: 429,
        statusText: "Too many subaccount created delete some",
      });
    }

    const ID = uuidv4();

    const new_notification: notificationsProps = {
      time: Date.now(),
      message: `A new subaccount has been created and await ${Intl.NumberFormat(
        "en-NG",
        { style: "currency", currency: "NGN", minimumFractionDigits: 2 }
      ).format(amount_to_recieve)} from ${payers_email}`,
      type: "info",
    };

    const current_time = Date.now();

    let temp_account_number = "";
    let find_account_number: account_number_props | null = null;

    //If the mock account created already exists continue to generate until it does not exist
    do {
      temp_account_number = await generate_mock_bank(new Date(current_time));
      find_account_number = await AccountModel.findOne({
        account_number: temp_account_number,
      });
    } while (find_account_number);

    const next_24_hours = 60 * 60 * 24 * 1000;

    const ACCOUNT_NAME =
      user.username + `--Sub${user.bulkAccountsCreated.length + 1}`;

    //Payload for to add to the existing subaccounts >>
    const new_subaccount: subaccountTypes = {
      id: ID,
      account_number: temp_account_number,
      state: "Active",
      amount_to_recieve: amount_to_recieve,
      payers_email: payers_email,
      created_at: current_time,
      is_received: false,
      account_name: ACCOUNT_NAME,
      expires_at: next_24_hours + current_time,
    };

    const updates: userProps<beneficiariesProps> | {} = {
      notifications: [...user.notifications, new_notification],
      bulkAccountsCreated: [...user.bulkAccountsCreated, new_subaccount],
    };

    const account_props = new AccountModel<account_number_props>({
      _id: new mongoose.Types.ObjectId(),
      account_name: `${user.username} --Sub ${
        user.bulkAccountsCreated.length + 1
      }`,
      account_number: temp_account_number,
      account_type: "sub_account",
      expires: next_24_hours + current_time,
      is_permanent: false,
      ref_id: ID,
      bank_name: "9JA WISE BANK",
      created_by: user._id.toString(),
    });

    await account_props.save().then(async () => {
      await UserModel.findByIdAndUpdate(user._id, updates);
    });
    await closeConnection();
    return new Response(null, {
      status: 200,
      statusText: "New Subaccount created",
    });
  } catch (error) {
    await closeConnection();
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};

//Might later add a feuature of re-activation of sub_accounts
