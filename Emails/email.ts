export const requestOTPEmail = (otp: number) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>One-Time Password (OTP) Verification</title>
      <style>
          body {
              font-family: 'Spectral', serif;
              background-color: #f7f7f7;
              margin: 0;
              padding: 0;
          }
  
          .container {
              background-color: #fff;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
  
          .header {
              background-color: #673ab7;
              color: #fff;
              text-align: center;
              padding: 20px 0;
          }
  
          .header h1 {
              font-size: 24px;
          }
  
          .content {
              padding: 20px;
          }
  
          .message {
              font-size: 16px;
              margin-bottom: 20px;
          }
  
          .otp-code {
              background-color: #f3f3f3;
              padding: 10px;
              border-radius: 5px;
              font-size: 18px;
              text-align: center;
          }
  
          .button {
              background-color: #673ab7;
              color: #fff;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              display: inline-block;
              font-size: 16px;
          }
  
          .button:hover {
              background-color: #421f6e;
          }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>One-Time Password (OTP) Verification</h1>
          </div>
          <div class="content">
              <p class="message">Here is your One-Time Password (OTP) for verification:</p>
              <div class="otp-code">${otp}</div>
              <p class="message">This OTP is valid for 15 minutes. Please do not share it with anyone.</p>
              <p class="message">If you didn't request this OTP or have any concerns, please contact our support team.</p>
              <a href=${process.env.HOSTNAME} class="button">Visit Our Website</a>
          </div>
      </div>
  </body>
  </html>
  `;
};

export const accountCreated = (link: string) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Created Successfully</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .button {
            background-color: #673ab7;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
        }

        .button:hover {
            background-color: #421f6e;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Created Successfully</h1>
        </div>
        <div class="content">
            <p class="message">Congratulations! Your account has been created successfully.</p>
            <p class="message">You can now start using our services.</p>
            <p class="message">If you have any questions or need assistance, please don't hesitate to contact us.</p>
            <a href="${process.env.HOSTNAME}/auth/login/${link}" class="button">Login to Your Account</a>
        </div>
    </div>
</body>
</html>

  `;
};

export const verifyEmailAddress = (link: string) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .button {
            background-color: #673ab7;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
        }

        .button:hover {
            background-color: #421f6e;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
            <p class="message">Thank you for signing up with us! To get started, please verify your email address by clicking the button below:</p>
            <a href='/${link}' class="button">Verify Email</a>
            <p class="message">If you did not create an account with us, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>

  `;
};

export const accountNumberCreated = (accountNumber: number) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Number Created</title>
        <style>
            body {
                font-family: 'Spectral', serif;
                background-color: #f7f7f7;
                margin: 0;
                padding: 0;
            }
    
            .container {
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
    
            .header {
                background-color: #673ab7;
                color: #fff;
                text-align: center;
                padding: 20px 0;
            }
    
            .header h1 {
                font-size: 24px;
            }
    
            .content {
                padding: 20px;
            }
    
            .message {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .button {
                background-color: #673ab7;
                color: #fff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                display: inline-block;
                font-size: 16px;
            }
    
            .button:hover {
                background-color: #421f6e;
            }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Account Number Created</h1>
            </div>
            <div class="content">
                <p class="message">Congratulations! Your account number has been successfully created.</p>
                <p class="message">Your new account number is: <strong>${accountNumber}</strong></p>
                <p class="message">You can now use your account number for transactions and other activities.</p>
                <p class="message">If you have any questions or need assistance, please don't hesitate to contact us.</p>
                <a href="#" class="button">Login to Your Account</a>
            </div>
        </div>
    </body>
    </html>
    
    `;
};

export const airtimePurchased = ({
  phone_number,
  amount,
  time,
}: {
  phone_number: string;
  amount: number | string;
  time: Date;
}) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Airtime Purchase Confirmation</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .button {
            background-color: #673ab7;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
        }

        .button:hover {
            background-color: #421f6e;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Airtime Purchase Confirmation</h1>
        </div>
        <div class="content">
            <p class="message">Thank you for your recent airtime purchase. Your transaction has been successfully completed.</p>
            <p class="message">Details of your transaction:</p>
            <ul>
                <li>Amount: ${amount}</li>
                <li>Mobile Number: ${phone_number}</li>
                <li>Date and Time: ${time.getUTCDate()}</li>
            </ul>
            <p class="message">If you have any questions or need assistance, please feel free to contact our support team.</p>
            <a href="#" class="button">Visit Our Website</a>
        </div>
    </div>
</body>
</html>

    `;
};

export const billPayment = ({
  name,
  billAmount,
  billType,
  accounNumber,
  transaction_id,
}: {
  name: string;
  billType: "Airtime" | "Bill" | "Data";
  billAmount: number | string;
  accounNumber: number | string;
  transaction_id: string;
}) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bill Payment Confirmation</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .bill-details {
            background-color: #f3f3f3;
            padding: 10px;
            border-radius: 5px;
        }

        .bill-details h2 {
            font-size: 18px;
            margin: 0;
            color: #333;
        }

        .bill-details p {
            font-size: 14px;
            margin: 0;
            color: #555;
        }

        .button {
            background-color: #673ab7;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
        }

        .button:hover {
            background-color: #421f6e;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bill Payment Confirmation</h1>
        </div>
        <div class="content">
            <p class="message">Dear ${name},</p>
            <p class="message">Your recent bill payment has been successfully processed.</p>
            <div class="bill-details">
                <h2>Bill Details:</h2>
                <p><strong>Bill Type:</strong> ${billType}</p>
                <p><strong>Bill Amount:</strong> ${billAmount}</p>
                <p><strong>Account Number:</strong> ${accounNumber}</p>
                <p><strong>Transaction ID:</strong> ${transaction_id}</p>
            </div>
            <p class="message">If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
            <a href="[Your Website URL]" class="button">Visit Our Website</a>
        </div>
    </div>
</body>
</html>

    `;
};

export const inviteEmail = ({
  friendName,
  userName,
  phoneNumber,
}: {
  friendName: string;
  userName: string;
  phoneNumber: string;
}) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE-edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invite Your Friend</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .button {
            background-color: #673ab7;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
        }

        .button:hover {
            background-color: #421f6e;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invite Your Friend</h1>
        </div>
        <div class="content">
            <p class="message">Hello ${friendName},</p>
            <p class="message">I wanted to invite you to join 9JA WISE. It's an amazing platform where you can Send And Recieve funds within nigeria.</p>
            <p class="message">This email is sent by ${userName}.</p>
            <p class="message">Here are some of the things you can do on 9Mobile:</p>
            <ul>
                <li>Free Account</li>
                <li>Account Security</li>
                <li>Instant Payment</li>
            </ul>
            <p class="message">I think you'll love it! Click the button below to create your account and get started:</p>
            <a href=${process.env.HOSTNAME} class="button">Join Now</a>
            <p class="message">You can reach me at ${phoneNumber} if you have any questions or need assistance.</p>
            <p class="message">Let's connect on 9JA WISE and enjoy the benefits together. See you there!</p>
        </div>
    </div>
</body>
</html>`;
};

export const savingBucketEmail = ({
  username,
  bucket_name,
  id,
  target_amount,
  date,
}: {
  username: string;
  bucket_name: string;
  id: string;
  target_amount: number;
  date: Date;
}) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE-edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Saving Bucket Created</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .button {
            background-color: #673ab7;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
        }

        .button:hover {
            background-color: #421f6e;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Saving Bucket Created</h1>
        </div>
        <div class="content">
            <p class="message">Dear ${username},</p>
            <p class="message">We are excited to inform you that a new saving bucket has been successfully created for you.</p>
            <p class="message">Here are the details:</p>
            <ul>
                <li><strong>Bucket Name:</strong> ${bucket_name}</li>
                <li><strong>Target Amount:</strong> ${target_amount}</li>
                <li><strong>Start Date:</strong> ${date}</li>
            </ul>
            <p class="message">You can start saving and tracking your progress toward your financial goals. Click the button below to view your new saving bucket:</p>
            <a href="${process.env.HOSTNAME}/account/${id}/home" class="button">View Saving Bucket</a>
            <p class="message">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <p class="message">Happy saving!</p>
        </div>
    </div>
</body>
</html>


    `;
};

export const withdrawFromBucket = ({
  username,
  bucket_name,
  target_amount,
  date,
}: {
  username: string;
  bucket_name: string;
  target_amount: number;
  date: string;
}) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Withdrawal from Savings Bucket</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .withdrawal-details {
            font-size: 16px;
        }

        .button {
            background-color: #673ab7;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
        }

        .button:hover {
            background-color: #421f6e;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Withdrawal from Savings Bucket</h1>
        </div>
        <div class="content">
            <p class="message">Hello ${username},</p>
            <p class="message">You have successfully withdrawn ${target_amount} from your savings bucket.</p>
            <p class="message">Here are the details of your withdrawal:</p>
            <div class="withdrawal-details">
                <p><strong>Amount Withdrawn:</strong> ${target_amount}</p>
                <p><strong>Savings Bucket:</strong> ${bucket_name}</p>
                <p><strong>Date and Time:</strong> ${date}</p>
            </div>
            <p class="message">If you have any questions or need further assistance, please don't hesitate to contact us.</p>
            <a href="${process.env.HOSTNAME}/auth/login" class="button">Login to Your Account</a>
        </div>
    </div>
</body>
</html>

    `;
};

export const deletedBucket = (bucket_name: string, username: string) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Savings Bucket Deleted</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .button {
            background-color: #673ab7;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
        }

        .button:hover {
            background-color: #421f6e;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Savings Bucket Deleted</h1>
        </div>
        <div class="content">
            <p class="message">Hello ${username},</p>
            <p class="message">Your savings bucket named ${bucket_name} has been successfully deleted.</p>
            <p class="message">If you'd like to explore other savings options or create a new bucket, feel free to do so.</p>
            <p class="message">If you have any questions or need further assistance, please don't hesitate to contact us.</p>
            <a href="#" class="button">Login to Your Account</a>
        </div>
    </div>
</body>
</html>

    `;
};

export type loginAttempt = {
  deviceName: string;
  username: string;
  ip_address: string;
  timestamp: Date;
};

export const login_attempt_email = ({
  deviceName,
  username,
  ip_address,
  timestamp,
}: loginAttempt) => {
  return `
    <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Failed Login Attempt</title>
  <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>

<body style="font-family: 'Spectral', serif;">
  <div style="background-color: #673ab7; padding: 20px; text-align: center; color: #fff;">
    <h1 style="font-size: 24px;">Failed Login Attempt</h1>
  </div>
  <div style="background-color: #fff; padding: 20px;">
    <p style="font-size: 16px;">Dear user,</p>
    <p style="font-size: 16px;">We noticed a failed login attempt on your account. Here are the details:</p>
    <ul>
      <li style="font-size: 16px;"><strong>Username:</strong> ${username}</li>
      <li style="font-size: 16px;"><strong>Device Info:</strong> ${deviceName}</li>
      <li style="font-size: 16px;"><strong>IP Address:</strong> ${ip_address}</li>
      <li style="font-size: 16px;"><strong>Timestamp:</strong> ${timestamp.toISOString()}</li>
    </ul>
    <p style="font-size: 16px;">If this login attempt wasn't you, please take immediate action to secure your account.
    </p>
    <p style="font-size: 16px;">If you initiated this login attempt and are facing issues, please contact our support
      team.</p>
    <p style="font-size: 16px;">Stay safe and secure!</p>
  </div>
</body>

</html>
    `;
};

export const reset_password_email = (link: string) => {
  return `
    <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: 'Spectral', serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }

    .container {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      background-color: #673ab7;
      color: #fff;
      text-align: center;
      padding: 20px 0;
    }

    .header h1 {
      font-size: 24px;
    }

    .content {
      padding: 20px;
    }

    .message {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .button {
      background-color: #673ab7;
      color: #fff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      display: inline-block;
      font-size: 16px;
    }

    .button:hover {
      background-color: #421f6e;
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset</h1>
    </div>
    <div class="content">
      <p class="message">You have requested a password reset for your account. To reset your password, please click the
        button below:</p>
      <a href="${link}" class="button">Reset Password</a>
      <p class="message">If you did not request this password reset, you can safely ignore this email.</p>
    </div>
  </div>
</body>

</html>
    `;
};

export const login_detect_email = (username: string, location: string) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Detected</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Login Detected</h1>
        </div>
        <div class="content">
            <p class="message">Hello ${username},</p>
            <p class="message">A recent login activity has been detected on your account.</p>
            <p class="message">Location: ${location}</p>
            <p class="message">If this was not you, please contact our support team immediately to secure your account.</p>
            <p class="message">Thank you for using our services.</p>
        </div>
    </div>
</body>
</html>


    `;
};

export const donation_campaign_email = (link: string) => {
  return `
    <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Campaign Created</title>
  <style>
    body {
      font-family: 'Spectral', serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }

    .container {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      background-color: #673ab7;
      /* Purple color for the header */
      color: #fff;
      text-align: center;
      padding: 20px 0;
    }

    .header h1 {
      font-size: 24px;
    }

    .content {
      padding: 20px;
    }

    .message {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .button {
      background-color: #673ab7;
      /* Purple color for the button */
      color: #fff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      display: inline-block;
      font-size: 16px;
    }

    .button:hover {
      background-color: #421f6e;
      /* Slightly darker purple on hover */
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>

<body>
  <div class "container">
    <div class="header">
      <h1>Donation Campaign Created</h1>
    </div>
    <div class="content">
      <p class="message">Congratulations! Your donation campaign has been successfully created.</p>
      <p class="message">You can now start sharing your campaign with others to make a positive impact.</p>
      <p class="message">If you have any questions or need assistance, please don't hesitate to contact us.</p>
      <a href=${link} class="button">View Your Campaign</a>
    </div>
  </div>
</body>

</html>
    `;
};

export const donation_receive_email = (amount: number) => {
  const format_currency = Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
  return `
    <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE-edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Received</title>
  <style>
    body {
      font-family: 'Spectral', serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }

    .container {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      background-color: #673ab7;
      /* Purple color for the header */
      color: #fff;
      text-align: center;
      padding: 20px 0;
    }

    .header h1 {
      font-size: 24px;
    }

    .content {
      padding: 20px;
    }

    .message {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .donation-amount {
      font-size: 20px;
      color: #673ab7;
      /* Purple color for the donation amount */
      font-weight: bold;
    }

    .button {
      background-color: #673ab7;
      /* Purple color for the button */
      color: #fff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      display: inline-block;
      font-size: 16px;
    }

    .button:hover {
      background-color: #421f6e;
      /* Slightly darker purple on hover */
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>Donation Received</h1>
    </div>
    <div class="content">
      <p class="message">Congratulations! You've received a donation of</p>
      <p class="donation-amount">${format_currency}</p>
      <p class="message">from a generous supporter for your campaign.</p>
      <p class="message">We appreciate their contribution and your efforts to make a positive impact.</p>
      <a href="#" class="button">View Your Campaign</a>
    </div>
  </div>
</body>

</html>
    `;
};

export const new_payment_email = (username: string, amount: number) => {
  const format_currency = Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Payment Detected</title>
    <style>
        body {
            font-family: 'Spectral', serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }

        .container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #673ab7;
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .header h1 {
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .button {
            background-color: #673ab7;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
        }

        .button:hover {
            background-color: #421f6e;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Payment Detected</h1>
        </div>
        <div class="content">
            <p class="message">Hello ${username},</p>
            <p class="message">A new payment of ${format_currency} has been detected in your account.</p>
            <p class="message">If you have any questions or concerns, please contact our support team.</p>
            <a href="#" class="button">View Details</a>
        </div>
    </div>
</body>
</html>

    `;
};
