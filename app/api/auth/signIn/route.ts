import {
  loginAttempt,
  login_attempt_email,
  login_detect_email,
} from "@/Emails/email";
import {
  countEmails,
  disableAcct,
  get_ipAddress,
  hashText,
  ip_addressProps,
  regexTesting,
  sendEmail,
} from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByEmail_Password,
  findUserById,
  findUserByPhoneNumber,
  findUserByPhoneNumber_Password,
  notificationsProps,
  pushNotification,
  userProps,
} from "@/Models/user";
import { NextResponse } from "next/server";

export type signinProps = {
  loginID: string | number;
  otp?: string;
  password?: string;
};

export enum securityReasons {
  suspiciousLogin = "Suspicious login",
  robot = "Might be a robot",
}

export const POST = async (req: Request) => {
  const { loginID, otp, password }: signinProps = await req.json();

  if (!loginID) {
    return new Response(null, {
      status: 400,
      statusText: "LoginID is required (Email or Phone Number)",
    });
  }

  try {
    // Connect to the database
    await connectDatabase();

    // Find the user by email or phone number
    const user: userProps<beneficiariesProps> | null =
      (await findUserByEmail(loginID as string)) ||
      (await findUserByPhoneNumber(String(loginID)));

    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "User not found",
      });
    }

    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: 401,
        statusText: "Account has been disabled (Unauthorized)",
      });
    }

    //This with run only if the turn on the whitelist ip_address in settings then we make this call then check the current user ip if it doesnt match return
    const check_current_ip = user.settings.whitelist_ip
      ? await get_ipAddress()
      : null;

    if (
      user.settings.whitelist_ip &&
      user.ip_address !== check_current_ip?.IPv4
    ) {
      const email_template = login_attempt_email({
        deviceName: req.headers.get("user-agent") as string,
        username: user.username,
        ip_address: check_current_ip?.IPv4 || "Unknown",
        timestamp: new Date(),
      });

      const new_notifications: notificationsProps = {
        type: "warning",
        time: Date.now(),
        message: `An unauthorized IP address just attempted to login your account. (IP: ${
          check_current_ip?.IPv4
        }) around ${new Date().toTimeString()}`,
      };

      //!Here are the updates to be perform when an unknow IP tries to login
      const updates: userProps<beneficiariesProps> | {} = {
        loginAttempts: {
          count: user.loginAttempts.count + 1,
          last_attempt: new Date(),
          ip_address: check_current_ip?.IPv4,
          reason: "",
        },
        suspisiousLogin: user.loginAttempts.count >= 3 ? true : false,
        notifications: [...user.notifications, new_notifications],
        logs: {
          ...user.logs,
          totalEmailSent: user.logs.totalEmailSent + 1,
        },
      };

      await Promise.all([
        UserModel.findByIdAndUpdate(user._id.toString(), updates),
        sendEmail({
          emailSubject: "Security Warning",
          emailTemplate: email_template,
          emailTo: user.email as string,
        }),
      ]);

      await closeConnection();
    }

    //If the user auth flow is OTP
    if (user?.loginType === "otp") {
      // Check for missing OTP
      if (!otp) {
        return new Response(null, {
          status: 404,
          statusText: "OTP is required for this operation",
        });
      }

      // Check for invalid OTP
      if (isNaN(Number(otp))) {
        return new Response(null, {
          status: 400,
          statusText: "OTP must be a number",
        });
      }

      // Verify the OTP
      const res = await fetch(
        `${process.env.HOSTNAME}/api/auth/requestOTP?otp=${otp}&email=${user.email}`
      );

      if (!res.ok) {
        await closeConnection();
        return new Response(null, {
          status: res.status,
          statusText: res.statusText,
        });
      }

      const email_template = login_detect_email(
        user.username,
        user.ip_address || "UNKNOWN"
      );

      await sendEmail({
        emailSubject: "Login Detected",
        emailTemplate: email_template,
        emailTo: user.email as string,
      });

      await closeConnection();
      // Prepare user data to return NEXTAUTH
      const data = {
        email: user.email,
        phoneNumber: user.phoneNumber,
        id: user._id.toString(),
        profileImage: user.profileImage,
        fullName: user.fullName,
      };

      return NextResponse.json({ data: data });
    }

    // Password Authentication
    if (user.loginType === "password") {
      // Check for missing password
      if (!password) {
        return new Response(null, {
          status: 401,
          statusText: "Missing Parameter (Password)",
        });
      }

      // Validate the password
      const checkPassword = regexTesting("password", password as string);

      if (!checkPassword) {
        return new Response(null, {
          status: 400,
          statusText: "Incorrect password",
        });
      }

      // Connect to the database
      await connectDatabase();

      // Find the user by email or phone number and password
      const user_with_password: userProps<beneficiariesProps> =
        user?.loginMode === "email"
          ? await findUserByEmail_Password(user?.email as string)
          : await findUserByPhoneNumber_Password(user?.phoneNumber as string);

      // Check for incorrect password
      const hashPassword = hashText(
        user_with_password?.authentication.salt,
        password as string
      );

      if (hashPassword !== user_with_password?.authentication.password) {
        const ip_address = await get_ipAddress();

        const new_notifications: notificationsProps = {
          time: Date.now(),
          type: "warning",
          message: `An attempt was made to login your account (IP Address: ${
            ip_address?.IPv4 || "UNKNOWN"
          }) by ${new Date().toISOString()}`,
        };

        const update: userProps<beneficiariesProps> | {} = {
          loginAttempts: {
            ip_address: ip_address?.IPv4 || "Unknown",
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
          deviceName: req.headers.get("user-agent") as string,
          username: user.username,
          ip_address: ip_address?.IPv4 || "Unknown",
          timestamp: new Date(),
        });

        await Promise.all([
          UserModel.findByIdAndUpdate(user._id.toString(), update),
          sendEmail({
            emailSubject: "Login Attempt on your account failed",
            emailTemplate: email_template,
            emailTo: user.email as string,
          }),
        ]);

        await closeConnection();
        return new Response(null, {
          status: 403,
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

      // Update the last login and other user data
      const update: userProps<beneficiariesProps> | {} = {
        logs: {
          ...user.logs,
          totalEmailSent:
            user.loginMode === "email"
              ? user.logs.totalEmailSent + 1
              : user.logs.totalEmailSent,
        },
        loginAttempts: {
          ...user.loginAttempts,
          count:
            user.loginAttempts?.last_attempt?.getDate() !== currentTime
              ? 0
              : user.loginAttempts.count + 1,
        },
      };

      const login_email = login_detect_email(
        user.username,
        user.ip_address || "UNKNOWN"
      );

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
        id: user._id.toString(),
        profileImage: user.profileImage,
      };

      await closeConnection();
      return NextResponse.json({ data: data });
    }
  } catch (error) {
    console.log(error);
    await closeConnection();
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
