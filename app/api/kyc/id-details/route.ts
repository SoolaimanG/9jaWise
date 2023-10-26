import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserById,
  userProps,
} from "@/Models/user";

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

  const _id = req.headers.get("user_id");

  if (!state && !city && !street_address && !nextOfKin && !nokName) {
    return new Response(null, {
      status: 403,
      statusText: "Missing field(s)",
    });
  }

  await connectDatabase();

  //!If unnecessary requests are detected disable account
  const findUser: userProps<beneficiariesProps> = await findUserById(
    _id as string
  );

  if (!findUser) {
    return new Response(null, {
      status: 404,
      statusText: "User not found (Invalid ID)",
    });
  }

  if (findUser.kyc_steps.length > 2) {
    return new Response(null, {
      status: 429,
      statusText: "ID Details Already Added",
    });
  }

  if (findUser.KYC_completed) {
    return new Response(null, {
      status: 429,
      statusText: "KYC Completed already",
    });
  }

  const updateValues = {
    KYC: {
      address: {
        state: state,
        street_address: street_address,
        city: city,
      },
      nextOfKin: {
        name: nextOfKin,
        nok: nokName,
      },
    },
    kyc_steps: ["first", "second", "third"],
  };

  try {
    await UserModel.findByIdAndUpdate(_id, updateValues);
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
