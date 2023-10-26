import { randomStrings, regexTesting } from "@/Functions/TS";
import { questions, services } from "./question";
import { LevenshteinDistance } from "natural";
import { accountProps } from "@/components/Bot/chatBot";
import { fetchData } from "@/components/Bot/helpers";
import {
  addTokenToDB,
  amNotARobotType,
  findAmNotARobotByRequestedBy,
  findAmNotARobotByToken,
  updateAmNotARobot,
} from "@/Models/amNotARobot";
import { closeConnection, connectDatabase } from "@/Models";

export type acctResProps = {
  response: string;
  options: string[];
  index: number;
  haveError: boolean;
};
type responseType = { response: string; option: string[] }[];

//Function to find number closer to zero
function findClosestToZero(numbers: number[]) {
  if (numbers.length === 0) {
    return null; // Handle the case when the array is empty
  }

  let closestNumber = numbers[0]; // Initialize with the first number

  for (let i = 1; i < numbers.length; i++) {
    const currentNumber = numbers[i];
    if (Math.abs(currentNumber) < Math.abs(closestNumber)) {
      closestNumber = currentNumber;
    } else if (Math.abs(currentNumber) === Math.abs(closestNumber)) {
      // Handle the case when two numbers are equidistant from zero
      closestNumber = Math.max(currentNumber, closestNumber);
    }
  }

  return closestNumber;
}

export const askQuestion = async (userInput: string) => {
  const splitUserInput = userInput.toLowerCase().split(" "); // Split the string into an array
  const response: responseType = [];
  const haveLessDistance: { id: number; score: number }[] = [];
  let choice: number | undefined;

  //Iterate through the predefined questions
  questions.forEach((question, index) => {
    const keywords = question.keyword;

    // Check if any keyword matches user input
    const matchedKeyword = keywords.find((keyword) =>
      splitUserInput.includes(keyword.toLowerCase())
    );

    choice = Math.floor(Math.random() * question.response.length);

    if (matchedKeyword) {
      // Select a random response
      const props = {
        response: question.response[choice],
        options: question.option,
      };
      //@ts-ignore
      response.push(props);
    } else {
      //Compare String Here!
      for (let i = 0; i < keywords.length; i++) {
        const element = keywords[i];

        const stringDistance = LevenshteinDistance(userInput, element);
        //
        const props = {
          id: index,
          score: stringDistance,
        };

        //
        haveLessDistance.push(props);
      }
    }
  });

  //Create a function to see the closest number to zero
  const closestNumber = findClosestToZero(haveLessDistance.map((d) => d.score));

  //Find the score of what closest number return [F-1]
  const findScoreAndIndex = haveLessDistance.find(
    (d) => d.score === closestNumber
  );

  if ((closestNumber as number) > 12) {
    const props = {
      response: "Sorry am not sure i understand what you are saying",
      options: [""],
    };

    //@ts-ignore
    response.push(props);
    return response;
  }

  //After getting what i needed i then find the current index return by [F-1]
  const findResponse = questions.find((_, i) => i === findScoreAndIndex?.id);

  //?The random choice this makes determine the response
  choice =
    findResponse && Math.floor(Math.random() * findResponse?.response?.length);

  const props = {
    response: findResponse?.response[choice as number] as string,
    options: findResponse?.option as string[],
  };

  //@ts-ignore
  response.push([props]);
  return response.flat();
};

export const customerService = async () => {
  const response: responseType = [];

  const choice = Math.floor(Math.random() * services.length);
  const props = {
    response: services[choice],
    options: [""],
  };

  //@ts-ignore
  response.push(props);
  return response;
};

/**
 * Creates a series of responses and instructions for the account creation process.
 *
 * @param {string} message - User's input message.
 * @param {number} id - Current step or stage in the account creation process.
 * @param {accountProps} AccountDetails - Object containing user's account details.
 * @returns {acctResProps[]} An array of response objects with instructions for the use**/

export const createAccount = async (
  message: string,
  id: number,
  AccountDetails: accountProps
) => {
  // Initialize response array and other variables
  const response: acctResProps[] = [];
  let index = 0; // Current step in the process
  let ResponsesMessage = ""; // Response message to be displayed to the user
  let haveError: boolean = false; // Flag to indicate if there's an error
  let amNotARobott: string | null; // Flag to indicating

  // Destructure account details for easy access
  const {
    password,
    confirmPassword,
    email,
    otp,
    amNotARobot,
    fullName,
    accountType,
    phoneNumber,
  } = AccountDetails;

  // Switch statement to handle different steps in the account creation process
  switch (id) {
    case 0:
      ResponsesMessage =
        "You just initiated a account creation mode,I will be asking you a bit of your personal information needed to create a new account(Reply to this is you are creating a new account other wise type clear/reset).";
      index++;
      break;
    case 1:
      ResponsesMessage =
        "Do you want to create a new account with your email address or phone number (type EMAIL or NUMBER).";
      index = 2;
      break;
    case 2:
      if (message === "email") {
        ResponsesMessage = "Please enter your email address.";
        index = 3;
      } else if (message === "number") {
        ResponsesMessage = "Please enter your phone number.";
        index = 3;
      }
      break;
    case 3:
      ResponsesMessage = "Enter your Full Name";
      index = 5;
      break;
    case 5:
      ResponsesMessage =
        "How do you want the authentication process (OTP for otp and PASSWORD for password).";

      index = 6;
      break;
    case 6:
      //Process for sending OTP and confirming password
      if (message === "otp") {
        const res = await fetch(
          `${process.env.HOSTNAME as string}/api/auth/requestOTP`,
          {
            method: "POST",
            body: JSON.stringify({
              loginMode: email ? "email" : "phoneNumber",
              email,
              phoneNumber,
            }),
            headers: { "Content-Type": "application/json" },
          }
        );

        if (res.ok) {
          ResponsesMessage = res.statusText + "(Enter OTP)";
          index = 8;
        } else {
          ResponsesMessage = "Unable to send OTP request please try again!";
          index = 1;
        }
      } else if (message === "password") {
        ResponsesMessage = "Please enter a strong Password.";
        index = 7;
      }
      break;
    case 7:
      ResponsesMessage = "Please confirm your password.";
      index = 8;
      break;
    case 8:
      const _AmNotARobot = randomStrings(); // Generate a random OTP
      amNotARobott = _AmNotARobot;

      await connectDatabase();

      const findRequest = await findAmNotARobotByRequestedBy(
        (email as string) || (phoneNumber as number)
      );

      if (findRequest) {
        //
        const updateRequest = await updateAmNotARobot(
          (email as string) || (phoneNumber as number),
          _AmNotARobot
        );
        console.log(updateRequest);
        ResponsesMessage = `Are you a robot? Retype this ${_AmNotARobot} for confirmation.`;
      } else {
        //
        const res = await addTokenToDB(
          _AmNotARobot,
          (email as string) || (phoneNumber as number)
        );
        console.log(res);
        ResponsesMessage = `Are you a robot? Retype this ${_AmNotARobot} for confirmation.`;
      }
      await closeConnection();
      index = 9;
      break;
    case 9:
      ResponsesMessage =
        "What type of account do you want to open (Type PERSONAL for personal and BUSINESS for business).";
      index = 10;
      break;
    default:
      // Handle validation and errors for the final step
      const testPassword = regexTesting("password", password as string);
      const testEmail = regexTesting("email", email as string);

      if (password && !testPassword) {
        haveError = true;
        ResponsesMessage =
          "Password must be at least 6 characters long and contain numbers and special characters.";

        const props = {
          response: ResponsesMessage,
          options: [""],
          index,
          haveError,
        };

        response.push(props);
        return response;
      }

      if (password && password !== confirmPassword) {
        haveError = true;
        ResponsesMessage = "Password does not match.";

        const props = {
          response: ResponsesMessage,
          options: [""],
          index,
          haveError,
        };

        response.push(props);
        return response;
      }

      if (email && !testEmail) {
        haveError = true;
        ResponsesMessage = "Invalid email address.";

        const props = {
          response: ResponsesMessage,
          options: [""],
          index,
          haveError,
        };

        response.push(props);
        return response;
      }

      await connectDatabase();

      const res: amNotARobotType = await findAmNotARobotByToken(
        amNotARobot as string
      );

      await closeConnection();

      if (amNotARobot !== res.amNotARobotToken) {
        haveError = true;
        ResponsesMessage = "Invalid AmNotaROBOT token error.";

        const props = {
          response: ResponsesMessage,
          options: [""],
          index,
          haveError,
        };

        response.push(props);
        return response;
      }

      if (Number.isNaN(otp)) {
        haveError = true;
        ResponsesMessage = "Invalid OTP";

        const props = {
          response: ResponsesMessage,
          options: [""],
          index,
          haveError,
        };

        response.push(props);
        return response;
      }

      if (otp) {
        const data = await fetchData(
          `${
            process.env.HOSTNAME as string
          }/api/auth/requestOTP?otp=${otp}&email_or_phoneNumber=${email}`
        );

        if (!data.ok) {
          haveError = true;
          ResponsesMessage = data.statusText;

          const props = {
            response: ResponsesMessage,
            options: [""],
            index,
            haveError,
          };

          response.push(props);
          return response;
        }
      }

      //SignUp

      //All test pass send request to /api/auth/signup to create a new account

      break;
  }

  const props = {
    response: ResponsesMessage,
    options: [""],
    index,
    haveError,
    //@ts-ignore
    amNotARobot: amNotARobott,
  };

  response.push(props);
  return response;
};
