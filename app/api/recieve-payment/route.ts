import { donation_receive_email, new_payment_email } from "@/Emails/email";
import {
  countEmails,
  refund_user,
  sendEmail,
  static_account_meta,
} from "@/Functions/TS";
import { closeConnection, connectDatabase } from "@/Models";
import { DonationModel } from "@/Models/donation";
import {
  UserModel,
  beneficiariesProps,
  findUserById,
  historyProps,
  notificationsProps,
  pushNotification,
  userProps,
} from "@/Models/user";
import { donationProps } from "@/provider";

export type verify_transaction_types = {
  status: "success" | "error";
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: "NGN";
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: "successfull";
    payment_type: string;
    created_at: string;
    account_id: number;
    meta: static_account_meta;
    amount_settled: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
  };
};

export const POST = async (req: Request) => {
  // Parse the incoming JSON payload
  const { payload } = await req.json();

  // Retrieve secret hash and signature from headers
  const secret_hash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = req.headers.get("verif-hash");

  // Check if the payload is missing
  if (!payload) {
    return new Response(null, {
      status: 403,
      statusText: "No payload",
    });
  }

  // Check if the signature is invalid
  if (!signature || signature !== secret_hash) {
    return new Response(null, {
      status: 403,
      statusText: "Invalid signature",
    });
  }

  // Send a verification request to Flutterwave API
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${payload?.id}/verify`,
    {
      headers: {
        Authorization: String(process.env.FLW_SECRET_KEY),
      },
    }
  );

  // Check if the verification request was not successful
  if (!res.ok) {
    return new Response(null, {
      status: res.status,
      statusText: res.statusText,
    });
  }

  // Parse the response data
  const { data }: verify_transaction_types = await res.json();

  // Check if the transaction status is successful
  if (data.status !== "successfull") {
    return new Response(null, {
      status: res.status,
      statusText: res.statusText,
    });
  }

  await connectDatabase();

  if (data.meta.type === "donation") {
    // Extract relevant data from the response
    const {
      amount_settled,
      meta: { ref_id },
      customer: { name, email, phone_number },
      id,
    } = data;

    // Find the donation based on ref_id
    const donation: donationProps | null = await DonationModel.findOne({
      _id: ref_id,
    });

    if (!donation) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "Donation not found",
      });
    }

    if (donation.amount_raised >= donation.target_amount) {
      await closeConnection();
      return new Response(null, {
        status: 429,
        statusText: "Target amount reached",
      });
    }

    // Find the user based on donation user_id
    const user: userProps<beneficiariesProps> | null = await UserModel.findById(
      donation.user_id
    );

    if (!user) {
      await closeConnection();
      return new Response(null, {
        statusText: "User not found",
        status: 404,
      });
    }

    // Check if the user's account is disabled
    if (user.disableAccount) {
      await closeConnection();
      return new Response(null, {
        statusText: "Account is disabled",
        status: 403,
      });
    }

    // Create an email template for the donation received
    const email_template = donation_receive_email(amount_settled);

    // Prepare data about the donator
    const donator = {
      name: name || email || phone_number,
      amount: amount_settled,
      date: new Date(),
    };

    // Update the donation details
    const total_amount_raised = donation.amount_raised + amount_settled;
    const updates = {
      amount_raised: total_amount_raised,
      donators: [...donation.donators, donator],
    };

    // Execute multiple operations asynchronously
    await Promise.all([
      DonationModel.findByIdAndUpdate(donation._id.toString(), updates),
      pushNotification(user._id.toString(), {
        type: "info",
        message: `Hello ${user.username}, Someone with the identifier ${
          name || email.split("@")[0] || phone_number
        } has donated ${amount_settled} to your campaign ${
          donation.donation_name
        } TOTAL AMOUNT DONATED: ${total_amount_raised}`,
        time: Date.now(),
      }),
      sendEmail({
        emailSubject: "New donation alert",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
      countEmails(user._id.toString(), user.logs.totalEmailSent),
    ]);

    await closeConnection();
    return new Response(null, {
      status: 200,
      statusText: "Payment Received",
    });
  }

  if (data.meta.type === "fund_account") {
    // Extract relevant data from the response
    const {
      amount_settled,
      flw_ref,
      meta: { user_id },
      id,
    } = data;

    await connectDatabase();
    const user: userProps<beneficiariesProps> | null = await findUserById(
      user_id
    );

    if (!user) {
      await closeConnection();
      return new Response(null, {
        status: 404,
        statusText: "User not found",
      });
    }

    if (user.disableAccount) {
      await refund_user({ id: id, amount: amount_settled });
      await closeConnection();
      return new Response(null, {
        status: 403,
        statusText: "Account is disabled",
      });
    }

    // Create a new history entry and notification
    const new_history: historyProps = {
      type: "credit",
      amount: amount_settled,
      refID: flw_ref,
      status: "complete",
      date: Date.now(),
      name: "Bank",
    };

    const new_notification: notificationsProps = {
      type: "credit",
      amount: amount_settled,
      time: Date.now(),
      transactionID: flw_ref,
      isRead: false,
    };

    // Create an email template for the new payment detected
    const email_template = new_payment_email(user.username, amount_settled);

    // Update the user's balance, logs, history, and notifications
    const update = {
      balance: user.balance + amount_settled,
      logs: {
        ...user.logs,
        totalEmailSent: user.logs.totalEmailSent + 1,
      },
      history: [...user.history, new_history],
      notifications: [...user.notifications, new_notification],
    };

    // Execute multiple operations asynchronously
    await Promise.all([
      UserModel.findByIdAndUpdate(user_id, update),
      sendEmail({
        emailSubject: "New payment detected",
        emailTemplate: email_template,
        emailTo: user.email as string,
      }),
    ]);

    await closeConnection();
    return new Response(null, {
      status: 200,
      statusText: "Payment received",
    });
  }
};
