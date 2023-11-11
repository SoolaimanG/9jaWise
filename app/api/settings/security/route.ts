import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { HTTP_STATUS } from "../../donation/withdraw/route";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { get_ipAddress } from "@/Functions/TS";

export type security_settings = {
  hide_balance: boolean;
  ask_for_auth: boolean;
  whitelist_ip: boolean;
  disable_transfer: boolean;
  two_factor_auth: boolean;
  switch_auth: boolean;
};

export const PATCH = async (req: Request) => {
  const {
    hide_balance,
    ask_for_auth,
    whitelist_ip,
    disable_transfer,
    two_factor_auth,
    switch_auth,
  }: security_settings = await req.json();

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
      notifications,
      _id,
      loginMode,
      phoneNumber,
      loginType,
    } = user;

    if (suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong",
      });
    }

    if (disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong",
      });
    }

    if (switch_auth && loginMode === "email" && !phoneNumber) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Add Phone Number and retry",
      });
    }

    if (switch_auth && loginMode === "phoneNumber" && !user.email) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Add Email and retry",
      });
    }

    const ip_address = await get_ipAddress();

    if (whitelist_ip && !ip_address) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong",
      });
    }

    if (loginMode === "phoneNumber" && loginType === "otp" && ask_for_auth) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot send OTP to Phone Number at the moment",
      });
    }

    if (loginMode === "phoneNumber" && loginType === "otp" && two_factor_auth) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong (Phone Number error)",
      });
    }

    const new_login_mode = loginMode === "email" ? "phoneNumber" : "email";

    const new_notification: notificationsProps = {
      time: Date.now(),
      type: "info",
      message: "Settings updated successfully",
    };

    const update: userProps<beneficiariesProps> | {} = {
      loginMode: switch_auth ? new_login_mode : loginMode,
      settings: {
        whitelist_ip: whitelist_ip,
        send_otp_for_each_transaction: ask_for_auth,
        disableTransfer: disable_transfer,
        twoFactorAuthentication: two_factor_auth,
        hidebalance: hide_balance,
      },
      notifications: [...notifications, new_notification],
    };

    await UserModel.findByIdAndUpdate(_id, update);

    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Changes Saved",
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
