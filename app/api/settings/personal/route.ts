import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { HTTP_STATUS } from "../../donation/withdraw/route";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { closeConnection, connectDatabase } from "@/Models";

export const PATCH = async (req: Request) => {
  const {
    username,
    phone_number,
    user_email,
    nationality,
    next_of_kin,
    nok_name,
    state,
    occupation,
    place_of_birth,
  }: {
    username: string;
    phone_number: string | number;
    user_email: string;
    nationality: string;
    state: string;
    next_of_kin: string;
    nok_name: string;
    occupation: string;
    place_of_birth: string;
  } = await req.json();

  if (!username && (!user_email || !phone_number)) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "Missing required parameters",
    });
  }

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
        statusText: "User Not Found",
      });
    }

    const {
      suspisiousLogin,
      disableAccount,
      notifications,
      _id,
      emailVerified,
      phoneNumber,
      phoneNumberVerified,
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

    const new_notification: notificationsProps = {
      time: Date.now(),
      type: "info",
      message: "Your profile has been updated successfully",
    };

    const update: userProps<beneficiariesProps> | {} = {
      username: username ? username : user.username,
      email: user_email,
      phoneNumber: phone_number ? phone_number : phoneNumber,
      phoneNumberVerified:
        phone_number &&
        String(phoneNumber).trim().toLowerCase() ===
          String(phone_number).trim().toLowerCase()
          ? phoneNumberVerified
          : false,
      emailVerified:
        user_email.trim().toLowerCase() === String(email).trim().toLowerCase()
          ? emailVerified
          : false,
      KYC: {
        address: {
          nationality: nationality ? nationality : user.KYC.address.nationality,
          state: state ? state : user.KYC.address.state,
          place_of_birth: place_of_birth
            ? place_of_birth
            : user.KYC.address.place_of_birth,
        },
        nextOfKin: {
          name: nok_name ? nok_name : user.KYC.nextOfKin.name,
          nok: next_of_kin ? next_of_kin : user.KYC.nextOfKin.nok,
        },
      },
      occupation: occupation ? occupation : user.occupation,
      notifications: [...notifications, new_notification],
    };

    await UserModel.findByIdAndUpdate(_id, update);

    await closeConnection();

    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "Profile Updated",
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
