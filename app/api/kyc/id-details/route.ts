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

export const PATCH = async (req: Request) => {
  const {
    state,
    street_address,
    city,
    nextOfKin,
    nokName,
  }: {
    state: string;
    city: string;
    street_address: string;
    nextOfKin: string;
    nokName: string;
  } = await req.json();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unathorized Please Login",
    });
  }

  const { email } = session.user;

  if (!state && !city && !street_address && !nextOfKin && !nokName) {
    return new Response(null, {
      status: 403,
      statusText: "Missing field(s)",
    });
  }

  await connectDatabase();

  const user: userProps<beneficiariesProps> | null =
    (await findUserByEmail(email as string)) ||
    (await findUserByPhoneNumber(email as string));

  if (!user) {
    await closeConnection();
    return new Response(null, {
      status: 404,
      statusText: "User not found (Invalid ID)",
    });
  }

  if (user.disableAccount) {
    await closeConnection();
    return new Response(null, {
      status: 400,
      statusText: "Account is disabled",
    });
  }

  if (user.suspisiousLogin) {
    await closeConnection();
    return new Response(null, {
      status: 400,
      statusText: "Cannot perform this action right now",
    });
  }

  if (user.kyc_steps.length >= 2) {
    await closeConnection();
    return new Response(null, {
      status: 429,
      statusText: "ID Details Already Added",
    });
  }

  if (user.KYC_completed) {
    await closeConnection();
    return new Response(null, {
      status: 429,
      statusText: "KYC Completed already",
    });
  }

  const new_notification: notificationsProps = {
    time: Date.now(),
    type: "info",
    message: "Identification details has been added successfully",
  };

  const updateValues: userProps<beneficiariesProps> | {} = {
    KYC: {
      ...user.KYC,
      address: {
        ...user.KYC.address,
        state: state,
        street_address: street_address,
        city: city,
      },
      nextOfKin: {
        name: nextOfKin,
        nok: nokName,
      },
    },
    kyc_steps: ["first", "second"],
    notifications: [...user.notifications, new_notification],
  };

  try {
    await UserModel.findByIdAndUpdate(user._id, updateValues);
    await closeConnection();
    return new Response(null, {
      status: 201,
      statusText: "KYC personal details updated successfully",
    });
  } catch (error) {
    return new Response(null, {
      status: 500,
      statusText: "Server error",
    });
  }
};
