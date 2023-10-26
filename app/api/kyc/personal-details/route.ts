import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserById,
  userProps,
} from "@/Models/user";

export const PATCH = async (req: Request) => {
  const {
    nationality,
    gender,
    place_of_birth,
    marital_status,
  }: {
    nationality: string;
    gender: "male" | "female";
    place_of_birth: string;
    marital_status: "married" | "single";
  } = await req.json();

  const _id = req.headers.get("user_id");

  if (!nationality && !gender && !place_of_birth && !marital_status) {
    return new Response(null, {
      status: 403,
      statusText: "Missing field(s)",
    });
  }

  await connectDatabase();

  const findUser: userProps<beneficiariesProps> = await findUserById(
    _id as string
  );

  if (!findUser) {
    return new Response(null, {
      status: 404,
      statusText: "User not found (Invalid ID)",
    });
  }

  if (findUser.KYC_completed) {
    return new Response(null, {
      status: 429,
      statusText: "KYC Completed already",
    });
  }

  if (findUser.kyc_steps.length > 1) {
    return new Response(null, {
      status: 400,
      statusText: "Personal Details Already Added",
    });
  }

  const updateValues = {
    KYC: {
      gender: gender,
      address: {
        nationality: nationality,
        place_of_birth: place_of_birth,
      },
      marital_status: marital_status,
    },
    kyc_steps: ["first", "second"],
  };

  try {
    await UserModel.findOneAndUpdate({ _id }, updateValues);
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
