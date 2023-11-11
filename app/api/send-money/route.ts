import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import {
  UserModel,
  beneficiariesProps,
  findUserByEmail,
  findUserByPhoneNumber,
  historyProps,
  notificationsProps,
  userProps,
} from "@/Models/user";
import { closeConnection, connectDatabase } from "@/Models";
import { hashText, sendEmail, user_with_password } from "@/Functions/TS";
import { HTTP_STATUS } from "../donation/withdraw/route";
import { AccountModel, account_number_props } from "@/Models/accountNumbers";
import {
  donation_receive_email,
  transaction_alert_email,
} from "@/Emails/email";
import { v4 as uuidv4 } from "uuid";

// Define the properties required to send money
export type send_money_props = {
  amount: number;
  accountName: string;
  account_number: string;
  password_or_otp: string | number;
};

// Main function for handling POST requests
export const POST = async (req: Request) => {
  // Extract required properties from the request body
  const {
    amount,
    password_or_otp,
    accountName,
    account_number,
  }: send_money_props = await req.json();

  // Retrieve the user's session using NextAuth's getServerSession
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized (Please Login)",
    });
  }

  const { email } = session.user;

  // Connect to the database
  await connectDatabase();

  try {
    // Find the user by email or phone number
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

    // Extract user properties
    const {
      balance,
      suspisiousLogin,
      disableAccount,
      history,
      notifications,
      settings: { send_otp_for_each_transaction, disableTransfer },
      KYC_completed,
      account: { accountNumber },
      loginMode,
      loginType,
    } = user;

    // Check if KYC is completed
    if (!KYC_completed) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Complete KYC and proceed",
      });
    }

    // Check if the user has an account number
    if (!accountNumber) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "User does not have an account number",
      });
    }

    // Check for suspicious login activity
    if (suspisiousLogin) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot perform this action right now",
      });
    }

    // Check if the user's account is disabled
    if (disableAccount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Account is disabled",
      });
    }

    if (disableTransfer) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Something went wrong",
      });
    }

    // Check if the user has sufficient balance
    if (balance < amount) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Insufficient balance amount",
      });
    }

    if (amount < 10) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: `Cannot send less than ${Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          minimumFractionDigits: 2,
        }).format(10)}`,
      });
    }

    // Check if OTP verification is required for each transaction
    if (send_otp_for_each_transaction) {
      if (loginMode === "email" && loginType === "otp") {
        // Verify OTP to the user's email
        const res = await fetch(
          `${process.env.NEXTAUTH_URL}/auth/requestOTP?otp=${password_or_otp}&email=${user.email}`
        );

        if (!res.ok) {
          return new Response(null, {
            status: res.status,
            statusText: res.statusText,
          });
        }
      }

      if (loginType === "password") {
        // Verify the password
        const target_user = await user_with_password(
          user.email as string,
          loginMode === "email" ? "email" : "phoneNumber"
        );

        if (!target_user) return;

        const {
          authentication: { salt, password },
        } = target_user;

        // Hash the provided password and compare it with the stored password
        const hash_password = hashText(salt, password_or_otp as string);

        //Compare the password against the stored password
        if (hash_password !== password) {
          await closeConnection();
          return new Response(null, {
            status: HTTP_STATUS.BAD,
            statusText: "Incorrect password",
          });
        }
      }

      //Return Error Cause we cannot send OTP to user's with Phonenumber right now
      if (loginMode === "phoneNumber" && loginType === "otp") {
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "Cannot send OTP to phone number right now",
        });
      }
    }

    // Find the recipient's account by account number
    const account_: account_number_props | null = await AccountModel.findOne({
      account_number: account_number,
    });

    //If Account Does Not Exist
    if (!account_) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "Account not found",
      });
    }

    const {
      ref_id,
      account_name,
      is_permanent,
      expires,
      account_type,
      created_by,
    } = account_;

    //If the name is not the same as the one provided from the client return avoid >>Avoid Sending to another user
    if (account_name.toLowerCase() !== accountName.toLowerCase()) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Account number does not match",
      });
    }

    if (created_by === user._id.toString()) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.BAD,
        statusText: "Cannot send money to your self",
      });
    }

    // Check if the account is not a permanent account and has expired
    const current_time = Date.now();
    if (!is_permanent && current_time > expires) {
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.CONFLICT,
        statusText: "Account has expired (Please reactivate account)",
      });
    }

    // Handle the donation account case
    if (account_type === "donation") {
      // Find the user who created the donation campaign
      const donation_creator: userProps<beneficiariesProps> | null =
        await UserModel.findOne({ _id: ref_id });

      //The next three check below are to see the current compatibility of the reciver account
      if (!donation_creator) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.NOT_FOUND,
          statusText: "Donation not found",
        });
      }

      if (donation_creator.disableAccount) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "Cannot send money to this account",
        });
      }

      if (donation_creator.suspisiousLogin) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "Cannot send money to this account at this moment",
        });
      }

      // Find the specific donation campaign
      const find_donation = donation_creator.donation_campaigns.find(
        (donation) => {
          return (
            donation.donation_account.account_number === account_.account_number
          );
        }
      );

      if (!find_donation) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.NOT_FOUND,
          statusText: "Donation not found",
        });
      }

      //If ther donation has already reach deadline
      if (current_time > new Date(find_donation.date).getTime()) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.FORBIDDEN,
          statusText: "Campaign has already expired",
        });
      }

      //If the target amount of the donation has been reached
      if (find_donation.amount_raised >= find_donation.target_amount) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.CONFLICT,
          statusText: "Donation target reached",
        });
      }

      // Create a new donation entry and update the user's notifications
      const new_donator = {
        name: user.fullName,
        amount: amount,
        date: new Date(),
      };

      const new_notifications: notificationsProps = {
        time: Date.now(),
        type: "info",
        message: `You received a donation from ${user.account.accountNumber}`,
      };

      // Update the donation campaign
      const updated_donations = donation_creator.donation_campaigns.map(
        (donation) => {
          return donation.donation_account.account_number ===
            account_.account_number
            ? {
                ...donation,
                amount_raised: donation.amount_raised + amount,
                donators: [...donation.donators, new_donator],
              }
            : { ...donation };
        }
      );

      const donation_updates: userProps<beneficiariesProps> | {} = {
        donation_campaigns: updated_donations,
        notifications: [...donation_creator.notifications, new_notifications],
        logs: {
          ...donation_creator.logs,
          totalEmailSent: donation_creator.logs.totalEmailSent + 1,
        },
      };

      //Unique ID for each transaction
      const tx_id = uuidv4();

      //Notify the user
      const user_notification: notificationsProps = {
        type: "debit",
        amount: amount,
        time: Date.now(),
        transactionID: tx_id,
        acct: Number(find_donation.donation_account.account_number),
      };

      //Update user history
      const user_history: historyProps = {
        type: "debit",
        amount: amount,
        refID: tx_id,
        status: "complete",
        date: Date.now(),
        name: donation_creator.username,
      };

      const user_updates: userProps<beneficiariesProps> | {} = {
        balance: balance - amount,
        history: [...history, user_history],
        notifications: [...notifications, user_notification],
      };

      // Prepare email templates for notifications
      const email_template = donation_receive_email(amount);
      const debit_email = transaction_alert_email({
        username: user.username,
        transaction_id: tx_id,
        date: new Date(),
        account_number: account_.account_number,
        amount: amount,
        type: "debit",
      });

      // Update the database with transaction details and send email notifications
      await UserModel.findByIdAndUpdate(
        donation_creator._id.toString(),
        donation_updates
      ).then(async () => {
        await UserModel.findByIdAndUpdate(user._id.toString(), user_updates);
        await sendEmail({
          emailSubject: "Donation received",
          emailTemplate: email_template,
          emailTo: donation_creator.email as string,
        });
        await sendEmail({
          emailSubject: "Debit Alert",
          emailTemplate: debit_email,
          emailTo: user.email as string,
        });
      });

      // Close the database connection
      await closeConnection();

      return new Response(null, {
        status: HTTP_STATUS.OK,
        statusText: "Transaction Successful",
      });
    }

    // Handle sub-accounts
    if (account_.account_type === "sub_account") {
      // Find the user who owns the sub-account
      const user_subaccount: userProps<beneficiariesProps> | null =
        await UserModel.findById(account_.created_by);

      if (!user_subaccount) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.NOT_FOUND,
          statusText: "Something went wrong",
        });
      }

      // Check if the sender is trying to send money to themselves
      if (user_subaccount._id.toString() === account_.created_by) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.FORBIDDEN,
          statusText: "Cannot send money to yourself",
        });
      }

      // Find the specific sub-account
      const find_subaccount = user_subaccount.bulkAccountsCreated.find(
        (account) => {
          return account.id === account_.ref_id;
        }
      );

      if (!find_subaccount) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.NOT_FOUND,
          statusText: "Something went wrong",
        });
      }

      // Check if the sub-account has expired
      if ((find_subaccount.expires_at as number) < Date.now()) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "Account has expired",
        });
      }

      if (find_subaccount.state === "Expired") {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "Account has expired",
        });
      }

      // Update the sub-account with the transaction details
      const updates_subaccount = user_subaccount.bulkAccountsCreated.map(
        (account) => {
          return account.id === account_.ref_id
            ? {
                ...account,
                is_received: amount >= account.amount_to_recieve ? true : false,
                amount_to_receive:
                  amount >= account.amount_to_recieve
                    ? 0
                    : account.amount_to_recieve - amount,
              }
            : { ...account };
        }
      );

      const sender_tx_id = uuidv4();
      const reciever_tx_id = uuidv4();

      // Create notifications and history entries for both parties
      const reciever_notification: notificationsProps = {
        type: "credit",
        transactionID: reciever_tx_id,
        time: Date.now(),
        amount: amount,
        acct: Number(user.account.accountNumber),
      };
      const sender_notification: notificationsProps = {
        type: "debit",
        transactionID: sender_tx_id,
        time: Date.now(),
        amount: amount,
        acct: Number(account_.account_number),
      };

      const receiver_history: historyProps = {
        type: "credit",
        amount: amount,
        refID: reciever_tx_id,
        status: "complete",
        date: Date.now(),
        name: user.username,
      };
      const sender_history: historyProps = {
        type: "debit",
        amount: amount,
        refID: sender_tx_id,
        status: "complete",
        date: Date.now(),
        name: user_subaccount.username,
      };

      const reciever_account_update: userProps<beneficiariesProps> | {} = {
        balance: user_subaccount.balance + amount,
        history: [...user_subaccount.history, receiver_history],
        notifications: [
          ...user_subaccount.notifications,
          reciever_notification,
        ],
        logs: {
          ...user_subaccount.logs,
          totalEmailSent: user_subaccount.logs.totalEmailSent + 1,
          lastTransaction: {
            tran_type: "credit",
            amount: amount,
          },
        },
        bulkAccountsCreated: updates_subaccount,
      };

      const user_account_update: userProps<beneficiariesProps> | {} = {
        balance: balance - amount,
        history: [...history, sender_history],
        notifications: [...notifications, sender_notification],
        logs: {
          ...user.logs,
          totalEmailSent: user.logs.totalEmailSent + 1,
          lastTransaction: {
            tran_type: "debit",
            amount: amount,
          },
        },
      };

      // Update both user accounts and send email notifications
      await Promise.all([
        await UserModel.findByIdAndUpdate(
          user_subaccount._id,
          reciever_account_update
        ),
        await UserModel.findByIdAndUpdate(user._id, user_account_update),
        await sendEmail({
          emailSubject: "Credit Alert",
          emailTemplate: transaction_alert_email({
            username: user_subaccount.username,
            transaction_id: reciever_tx_id,
            date: new Date(),
            account_number: String(user.account.accountNumber),
            amount: amount,
            type: "credit",
          }),
          emailTo: user_subaccount.email as string,
        }),
        await sendEmail({
          emailSubject: "Debit Alert",
          emailTemplate: transaction_alert_email({
            username: user.username,
            transaction_id: sender_tx_id,
            date: new Date(),
            account_number: String(user_subaccount.account.accountNumber),
            amount: amount,
            type: "debit",
          }),
          emailTo: user.email as string,
        }),
      ]);

      // Close the database connection
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.OK,
        statusText: "Transaction Successful",
      });
    }

    // Handle basic account transactions
    if (account_.account_type === "basic") {
      // Find the recipient's account
      const reciever: userProps<beneficiariesProps> | null =
        await UserModel.findById(account_.ref_id);

      if (!reciever) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.NOT_FOUND,
          statusText: "Receiver's account not found",
        });
      }

      if (reciever.disableAccount) {
        await closeConnection();
        return new Response(null, {
          status: HTTP_STATUS.BAD,
          statusText: "Receiver's account is disabled",
        });
      }

      // Generate a unique transaction ID
      const transaction_id = uuidv4();

      // Create notifications and history entries for both parties
      const reciever_new_notification: notificationsProps = {
        type: "credit",
        time: Date.now(),
        amount: amount,
        acct: user.account.accountNumber as number,
        transactionID: transaction_id,
      };
      const reciever_new_history: historyProps = {
        type: "credit",
        amount: amount,
        refID: transaction_id,
        status: "complete",
        date: Date.now(),
        name: user.username,
        transactionFrom: String(user.account.accountNumber),
        transactionTo: account_.account_number as string,
      };

      const sender_new_notification: notificationsProps = {
        type: "debit",
        time: Date.now(),
        amount: amount,
        acct: Number(account_.account_number),
        transactionID: transaction_id,
      };
      const sender_new_history: historyProps = {
        type: "debit",
        amount: amount,
        refID: transaction_id,
        status: "complete",
        date: Date.now(),
        name: reciever.username,
        transactionFrom: String(user.account.accountNumber),
        transactionTo: account_.account_number as string,
      };

      const receiver_update: userProps<beneficiariesProps> | {} = {
        balance: reciever.balance + amount,
        logs: {
          ...user.logs,
          lastTransaction: {
            tran_type: "credit",
            amount: amount,
          },
          totalEmailSent: reciever.logs.totalEmailSent + 1,
        },
        history: [...reciever.history, reciever_new_history],
        notifications: [...reciever.notifications, reciever_new_notification],
      };
      const sender_update: userProps<beneficiariesProps> | {} = {
        balance: user.balance - amount,
        logs: {
          ...user.logs,
          lastTransaction: {
            tran_type: "debit",
            amount: amount,
          },
          totalEmailSent: user.logs.totalEmailSent + 1,
        },
        history: [...user.history, sender_new_history],
        notifications: [...user.notifications, sender_new_notification],
      };

      // Update both user accounts and send email notifications
      await UserModel.findByIdAndUpdate(user._id, sender_update).then(
        async () => {
          await UserModel.findByIdAndUpdate(reciever._id, receiver_update),
            await sendEmail({
              emailSubject: "Credit Alert",
              emailTemplate: transaction_alert_email({
                username: reciever.username,
                transaction_id: transaction_id,
                amount: amount,
                date: new Date(),
                type: "credit",
                account_number: String(user.account.accountNumber),
              }),
              emailTo: reciever.email as string,
            });
          await sendEmail({
            emailSubject: "Debit Alert",
            emailTemplate: transaction_alert_email({
              username: user.username,
              transaction_id: transaction_id,
              amount: amount,
              date: new Date(),
              type: "debit",
              account_number: String(reciever.account.accountNumber),
            }),
            emailTo: user.email as string,
          });
        }
      );

      // Close the database connection
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.OK,
        statusText: "Transaction Success",
      });
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
