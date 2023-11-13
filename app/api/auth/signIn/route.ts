import { login_attempt_email, login_detect_email } from "@/Emails/email";
import {
  currentTime,
  disableAcct,
  get_ipAddress,
  hashText,
  regexTesting,
  sendEmail,
} from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByEmail_Password,
  findUserByPhoneNumber,
  findUserByPhoneNumber_Password,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { NextResponse } from "next/server";
import { HTTP_STATUS } from "../../donation/withdraw/route";
import { otpProps } from "../requestOTP/route";

export type signinProps = {
  loginID: string | number;
  otp?: string;
  password?: string;
};

export enum securityReasons {
  suspiciousLogin = "Suspicious login",
  robot = "Might be a robot",
}

const login_attempt = async (
  user: userProps<beneficiariesProps>,
  device_name: string
) => {
  const ip_address = await get_ipAddress();

  const new_notifications: notificationsProps = {
    time: Date.now(),
    type: "warning",
    message: `An attempt was made to login your account (IP Address: ${
      ip_address?.IPv4 ?? "UNKNOWN"
    }) by ${new Date().toISOString()}`,
  };

  const update: userProps<beneficiariesProps> | {} = {
    loginAttempts: {
      ip_address: ip_address?.IPv4 ?? "Unknown",
      last_attempt: new Date(),
      reason: securityReasons.suspiciousLogin,
      count: user.loginAttempts.count + 1,
    },
    suspisiousLogin: user.loginAttempts.count >= 3 ? true : false,
    notifications: [...user.notifications, new_notifications],
    logs: {
      ...user.logs,
      totalEmailSent: user.logs.totalEmailSent + 1,
    },
  };

  const email_template = login_attempt_email({
    deviceName: device_name as string,
    username: user.username,
    ip_address: ip_address?.IPv4 ?? "Unknown",
    timestamp: new Date(),
  });

  await UserModel.findByIdAndUpdate(user._id.toString(), update).then(
    async () => {
      await sendEmail({
        emailSubject: "Login Attempt on your account failed",
        emailTemplate: email_template,
        emailTo: user.email as string,
      });
    }
  );
};

export const POST = async (req: Request) => {
  const { loginID, otp, password }: signinProps = await req.json();

  if (!loginID) {
    return new Response(null, {
      status: HTTP_STATUS.BAD,
      statusText: "LoginID is required (Email or Phone Number)",
    });
  }

  // Connect to the database
  await connectDatabase();
  try {
    // Find the user by email or phone number
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(loginID as string)) ||
      (await findUserByPhoneNumber(String(loginID)));

    //If the !USER is not true return NOT-FOUND --> 404
    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "User not found",
      });
    }

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: "Account has been disabled (Unauthorized)",
      });
    }

    const ip_address = await get_ipAddress(); //Get the current IP address of the client

    if (user.settings.whitelist_ip && user.ip_address !== ip_address?.IPv4) {
      const email_template = login_attempt_email({
        deviceName: req.headers.get("user-agent") as string,
        username: user.username,
        ip_address: ip_address?.IPv4 ?? "Unknown",
        timestamp: new Date(),
      });

      //New Notification to show the user when they enter account
      const new_notifications: notificationsProps = {
        type: "warning",
        time: Date.now(),
        message: `An unauthorized IP address just attempted to login your account. (IP: ${
          ip_address?.IPv4
        }) around ${new Date().toTimeString()}`,
      };

      //Here are the updates to be perform when an unknow IP tries to login
      const updates: userProps<beneficiariesProps> | {} = {
        loginAttempts: {
          count: user.loginAttempts.count + 1,
          last_attempt: new Date(),
          ip_address: ip_address?.IPv4 ?? "UNKNOWN",
          reason: "",
        },
        suspisiousLogin: user.loginAttempts.count >= 3 ? true : false,
        notifications: [...user.notifications, new_notifications],
        logs: {
          ...user.logs,
          totalEmailSent: user.logs.totalEmailSent + 1,
          lastLogin: Date.now(),
        },
      };

      await UserModel.findByIdAndUpdate(user._id.toString(), updates).then(
        () => {
          sendEmail({
            emailSubject: "Security Warning",
            emailTemplate: email_template,
            emailTo: user.email as string,
          });
        }
      );

      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: "Unauthorized (IP not whitelisted)",
      });
    }

    //If the user auth flow is OTP
    if (user?.loginType === "otp") {
      // Check for missing OTP
      if (!otp) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "OTP is required for this operation",
        });
      }

      // Check for invalid OTP
      if (isNaN(Number(otp))) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "OTP must be a number",
        });
      }

      // Verify the OTP http:localhost:8080/api/auth/requestOTP -->GET request
      const res = await fetch(
        `${process.env.HOSTNAME}/api/auth/requestOTP?otp=${otp}&email=${user.email}`
      );

      if (!res.ok) {
        await login_attempt(user, req.headers.get("user-agent") as string);
        await closeConnection();
        return new Response(null, {
          status: res.status,
          statusText: res.statusText,
        });
      }

      //Login detection template --> Info on the currenct login destination
      const email_template = login_detect_email(
        user.username,
        ip_address?.IPv4 || "UNKNOWN"
      );

      await sendEmail({
        //Notify user about the login
        emailSubject: "Login Detected",
        emailTemplate: email_template,
        emailTo: user.email as string,
      });

      //Updates Operation
      const update: userProps<beneficiariesProps> | {} = {
        logs: {
          ...user.logs,
          totalEmailSent:
            user.loginMode === "email"
              ? user.logs.totalEmailSent + 1
              : user.logs.totalEmailSent,
          lastLogin: Date.now(),
        },
        loginAttempts: {
          ...user.loginAttempts,
          count:
            user.loginAttempts?.last_attempt?.getDate() !== Date.now()
              ? 0
              : user.loginAttempts.count + 1,
        },
      };

      await UserModel.findByIdAndUpdate(user._id, update); //Update user last login
      await closeConnection(); //Close Connection
      // Prepare user data to return NEXTAUTH
      const data = {
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        fullName: user.fullName,
      };

      return NextResponse.json({ data: data }); //Return this to NEXTAUTH for session creation and to be able to access the user properties
    }

    // Password Authentication
    if (user.loginType === "password") {
      // Check for missing password
      if (!password) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.UNAUTHORIZED,
          statusText: "Missing Parameter (Password)",
        });
      }

      // Validate the password using REGEX
      const checkPassword = regexTesting("password", password as string);

      //if the password does not meet reuirement don't bother comparing
      if (!checkPassword) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "Incorrect password",
        });
      }

      // Find the user by email or phone number and password
      const user_with_password: userProps<beneficiariesProps> =
        user?.loginMode === "email"
          ? await findUserByEmail_Password(user?.email as string)
          : await findUserByPhoneNumber_Password(user?.phoneNumber as string);

      // HashPassword to be able to compare preovided password and password in the DB
      const hashPassword = hashText(
        user_with_password?.authentication.salt,
        password as string
      );

      //Check if the password provided is not matching with the one in the DB
      if (hashPassword !== user_with_password?.authentication.password) {
        await login_attempt(user, req.headers.get("user-agent") as string);

        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "Incorrect password",
        });
      }

      const currentTime = new Date().getDate();
      // Check for excessive login attempts and disable the account if needed
      if (user.loginAttempts.count >= 8) {
        await disableAcct(user._id.toString());

        await closeConnection();
        return new Response(null, {
          statusText:
            "Too many login attempts account has been temporarily disabled",
        });
      }

      //      if (user.settings.twoFactorAuthentication) {
      //        if (otp) {
      //          const res = await fetch(
      //            `${process.env.HOSTNAME}/api/auth/requestOTP?otp=${otp}&email=${user.email}`
      //          );
      //
      //          if (!res.ok) {
      //            await login_attempt(user, req.headers.get("user-agent") as string);
      //            await closeConnection();
      //            return new Response(null, {
      //              status: res.status,
      //              statusText: res.statusText,
      //            });
      //          }
      //        } else {
      //          const payload: otpProps = {
      //            loginMode: "email",
      //            email: user.email as string,
      //          };
      //
      //          const res = await fetch(
      //            `${process.env.NEXTAUTH_URL}/api/auth/requestOTP`,
      //            {
      //              method: "POST",
      //              body: JSON.stringify(payload),
      //            }
      //          );
      //
      //          if (!res.ok) {
      //            await closeConnection();
      //            return new Response(null, {
      //              status: res.status,
      //              statusText: res.statusText,
      //            });
      //          }
      //
      //          return new Response(null, {
      //            status: 300,
      //            statusText: res.statusText,
      //          });
      //        }
      //      }

      // Update the last login and other user data
      const update: userProps<beneficiariesProps> | {} = {
        logs: {
          ...user.logs,
          totalEmailSent:
            user.loginMode === "email"
              ? user.logs.totalEmailSent + 1
              : user.logs.totalEmailSent,
          lastLogin: Date.now(),
        },
        loginAttempts: {
          ...user.loginAttempts,
          count:
            user.loginAttempts?.last_attempt?.getDate() !== currentTime
              ? 0
              : user.loginAttempts.count + 1,
        },
      };

      //an email template that contain information about the login detection
      const login_email = login_detect_email(
        user.username,
        ip_address?.IPv4 || "UNKNOWN"
      );

      //Using promise.all to ensure that the request send at the same time with the email to be sent to user
      await Promise.all([
        UserModel.findByIdAndUpdate(user._id.toString(), update),
        sendEmail({
          emailSubject: "Login Detected",
          emailTemplate: login_email,
          emailTo: user?.email as string,
        }),
      ]);

      // Prepare user data to return
      const data = {
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        fullName: user.fullName,
      };

      await closeConnection();
      return NextResponse.json({ data: data }); //Return this to NEXTAUTH for session creation and to be able to access the user properties
    }
  } catch (error) {
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
