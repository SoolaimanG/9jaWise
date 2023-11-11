import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  userProps,
} from "@/Models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { HTTP_STATUS } from "../../donation/withdraw/route";
import { closeConnection, connectDatabase } from "@/Models";

export const PATCH = async (req: Request) => {
  const {
    accountName,
    accountNumber,
    account_bank,
    bankName,
  }: beneficiariesProps = await req.json();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized Please Login",
    });
  }

  if (!accountName && !accountNumber && !account_bank) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Something went wrong",
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

    const find_account = user.beneficiaries.find((account) => {
      return (
        account.accountNumber.trim().toLowerCase() ===
          accountNumber.trim().toLowerCase() &&
        account.accountName.trim().toLowerCase() ===
          accountName.trim().toLowerCase()
      );
    });

    if (find_account) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "User Already In Your Beneficiary",
      });
    }

    const new_beneficiary: beneficiariesProps = {
      accountName: accountName,
      accountNumber: accountNumber,
      bankName: bankName,
      account_bank: account_bank,
    };

    const updates: userProps<beneficiariesProps> | {} = {
      beneficiaries: [...user.beneficiaries, new_beneficiary],
    };

    await UserModel.findByIdAndUpdate(user._id, updates);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Added to beneficiaries",
    });
  } catch (error) {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};

export const DELETE = async (req: Request) => {
  const { account_number }: { account_number: string } = await req.json();

  if (!account_number) {
    return new Response(null, {
      status: HTTP_STATUS.NOT_FOUND,
      statusText: "Missing parameter",
    });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized Please Login",
    });
  }

  const { email } = session?.user;

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

    const { beneficiaries } = user;

    const find_beneficiary = beneficiaries.find((account) => {
      return account.accountNumber === account_number;
    });

    if (!find_beneficiary) {
      return new Response(null, {
        statusText: "Beneficiary not found",
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    const remove_beneficiary = beneficiaries.filter((account) => {
      return account.accountNumber.trim() !== account_number.trim();
    });

    const update_database: userProps<beneficiariesProps> | {} = {
      beneficiaries: remove_beneficiary,
    };

    await UserModel.findByIdAndUpdate(user._id, update_database);

    await closeConnection();

    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Account removed from beneficiary",
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
