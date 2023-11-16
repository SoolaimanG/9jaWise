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
import { closeConnection } from "@/Models";

export const POST = async (req: Request) => {
  const { account_id }: { account_id: string } = await req.json();

  if (!account_id) {
    return new Response(null, {
      status: 404,
      statusText: "Required missing parameter",
    });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized Please login",
    });
  }

  const { email } = session.user;

  try {
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(String(email))) ||
      (await findUserByPhoneNumber(String(email)));

    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "User not found",
      });
    }

    const { bulkAccountsCreated, notifications } = user;

    const subaccount = bulkAccountsCreated.find((account) => {
      return account.id === account_id;
    });

    if (!subaccount) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "Incorrect account ID",
      });
    }

    const current_time = Date.now();

    if (current_time > Number(subaccount.expires_at)) {
      await closeConnection();
      return new Response(null, {
        status: 400,
        statusText: "Account is still active",
      });
    }

    const new_subaccount = bulkAccountsCreated.map((account) => {
      return account.id === account_id
        ? { ...account, expires_at: current_time + 15 + 30, state: "Active" }
        : { ...account };
    });

    const new_notfiction: notificationsProps = {
      time: Date.now(),
      message: `Subaccount with the account number ${subaccount.account_number} has been reactivated`,
      type: "info",
    };

    const updates: userProps<beneficiariesProps> | {} = {
      bulkAccountsCreated: new_subaccount,
      notifications: [...notifications, new_notfiction],
    };

    await UserModel.findByIdAndUpdate(user._id, updates);
    await closeConnection();
    return new Response(null, {
      status: 200,
      statusText: "Account reactivated",
    });
  } catch (error: any) {
    console.log(error);
    await closeConnection();
    return new Response(null, { status: 500, statusText: error.message });
  }
};
