import { requestOTPEmail } from "@/Emails/email";
import { generateOTP, regexTesting, sendEmail } from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import {
  checkIfUserAlreadyRequestedByEmail,
  checkOTP,
  requestOTPModel,
  requestOTPProps,
} from "@/Models/requestOTP";
import { NextRequest } from "next/server";
import { HTTP_STATUS } from "../../donation/withdraw/route";

export type otpProps = {
  loginMode: "email" | "phoneNumber";
  email?: string;
  phoneNumber?: string | number;
};

const nextRequestTime = 30 * 1000; // 30 seconds
const maxRequests = 5; // Maximum allowed requests within the time frame

export const POST = async (req: NextRequest) => {
  try {
    const { loginMode, email }: otpProps = await req.json(); //Extract the payload from the request.json object

    //Can only send OTP to users with email
    if (loginMode !== "email") {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "OTP request to phone number is not supported.",
      });
    }

    //Check if the email is valid
    const checkEmail = regexTesting("email", email as string);

    if (!checkEmail) {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Invalid email address.",
      });
    }

    await connectDatabase(); // Open the database connection at the beginning

    const alreadyRequested: requestOTPProps | null =
      await checkIfUserAlreadyRequestedByEmail(
        email?.toLowerCase().trim() as string
      );

    if (alreadyRequested) {
      const currentTime = Date.now();
      const timeDifference = alreadyRequested.nextRequest - currentTime;

      const thirty_min_frame =
        alreadyRequested.nextRequest > currentTime + 30 * 60;

      if (!thirty_min_frame && timeDifference > 0) {
        return new Response(null, {
          status: HTTP_STATUS.TOO_MANY,
          statusText: `Rate limit exceeded. Try again in ${Math.ceil(
            timeDifference / 1000
          )} seconds.`,
        });
      }
    }

    const _OTP = generateOTP(6);
    const emailTemplate = requestOTPEmail(_OTP);

    const next15minutes = 60 * 15 * 1000; // 15 minutes
    const expireTime = Date.now() + next15minutes; //The OTP should expire in the next 15Mins

    const updateOptions: requestOTPProps = {
      otp: _OTP,
      requestCount: (alreadyRequested?.requestCount || 0) + 1,
      nextRequest:
        Date.now() +
        nextRequestTime *
          Math.min(maxRequests, (alreadyRequested?.requestCount || 0) + 1),
      expires: expireTime,
      otp_for: email?.toLowerCase() as string,
      otp_used: false,
    };

    if (alreadyRequested) {
      await Promise.all([
        requestOTPModel.findOneAndUpdate({ otp_for: email }, updateOptions),
        sendEmail({
          emailSubject: "Notification",
          emailTemplate: emailTemplate,
          emailTo: email as string,
        }),
      ]);

      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.OK,
        statusText: "OTP request sent successfully.",
      });
    } else {
      const otpModel = new requestOTPModel<requestOTPProps>({
        otp: _OTP,
        otp_for: email as string,
        requestCount: 1,
        nextRequest: nextRequestTime + Date.now(),
        otp_used: false,
        expires: expireTime,
      });

      await Promise.all([
        otpModel.save(),
        sendEmail({
          emailSubject: "Notification",
          emailTemplate: emailTemplate,
          emailTo: email as string,
        }),
      ]);

      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.OK,
        statusText: "OTP request sent successfully.",
      });
    }
  } catch (error) {
    // Log the error for debugging purposes.
    console.error(error);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};

export const GET = async (req: Request) => {
  const parser = new URL(req.url); //put the url in the URL constructor

  const otp = parser.searchParams.get("otp");
  const email = parser.searchParams.get("email");

  try {
    if (!otp) {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Missing OTP",
      });
    }

    if (isNaN(Number(otp))) {
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Invalid OTP",
      });
    }

    const checkForOTP = await checkOTP(otp);

    if (!checkForOTP) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Invalid OTP",
      });
    }

    if (checkForOTP.otp_for.toLowerCase() !== email?.trim().toLowerCase()) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: "Something went wrong",
      });
    }

    if (checkForOTP.expires < Date.now()) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "OTP has expired",
      });
    }

    await requestOTPModel.findOneAndDelete({ otp: otp });

    return new Response(null, {
      status: HTTP_STATUS.OK,
      statusText: "OTP verification successful",
    });
  } catch (error) {
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Server error",
    });
  }
};
