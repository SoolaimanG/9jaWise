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
    nationality,
    gender,
    place_of_birth,
    marital_status,
    date_of_birth,
  }: {
    nationality: string;
    gender: "male" | "female";
    place_of_birth: string;
    marital_status: "married" | "single";
    date_of_birth: Date;
  } = await req.json();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized (Please Login)",
    });
  }

  const { email } = session.user;

  if (
    !nationality &&
    !gender &&
    !place_of_birth &&
    !marital_status &&
    !date_of_birth
  ) {
    return new Response(null, {
      status: 403,
      statusText: "Missing field(s)",
    });
  }

  const date_to_use = new Date(date_of_birth);

  if (typeof date_to_use.getTime() !== "number") {
    return new Response(null, {
      status: 400,
      statusText: "Invalid date",
    });
  }

  const validate_date_of_birth = date_to_use.getTime() <= Date.now();

  if (!validate_date_of_birth) {
    return new Response(null, {
      status: 400,
      statusText: "Use previous date",
    });
  }

  await connectDatabase();

  const user: userProps<beneficiariesProps> | null =
    (await findUserByEmail(email as string)) ||
    (await findUserByPhoneNumber(email as string));

  if (!user) {
    return new Response(null, {
      status: 404,
      statusText: "User not found (Invalid ID)",
    });
  }

  if (user.KYC_completed) {
    return new Response(null, {
      status: 429,
      statusText: "KYC Completed already",
    });
  }

  if (user.kyc_steps.length >= 1) {
    return new Response(null, {
      status: 400,
      statusText: "Personal Details Already Added",
    });
  }

  const new_notification: notificationsProps = {
    time: Date.now(),
    type: "info",
    message: "Personal Details Added Successfully",
  };

  const updateValues: userProps<beneficiariesProps> | {} = {
    KYC: {
      ...user.KYC,
      gender: gender,
      address: {
        ...user.KYC.address,
        nationality: nationality,
        place_of_birth: place_of_birth,
      },
      marital_status: marital_status,
      date_of_birth: new Date(),
    },
    kyc_steps: ["first"],
    notifications: [...user.notifications, new_notification],
  };

  try {
    await UserModel.findByIdAndUpdate(user._id, updateValues);
    await closeConnection();
    return new Response(null, {
      status: 200,
      statusText: "KYC personal details updated successfully",
    });
  } catch (error) {
    return new Response(null, {
      status: 500,
      statusText: "Server error",
    });
  }
};
