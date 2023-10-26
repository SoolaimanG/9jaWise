import {
  acctResProps,
  askQuestion,
  createAccount,
  customerService,
} from "./processor";
import { accountProps } from "@/components/Bot/chatBot";

export const POST = async (req: Request) => {
  const {
    message,
    mode,
    id,
    accountProps,
  }: {
    message: string;
    mode: "CUSTOMER-SERVICE" | "ASK-QUESTION" | "CREATE-ACCOUNT";
    id?: number;
    accountProps: accountProps;
  } = await req.json();

  if (mode === "CUSTOMER-SERVICE") {
    const response = await customerService();

    return new Response(JSON.stringify(response), {
      status: 200,
      statusText: "OK",
    });
  } else if (mode === "ASK-QUESTION") {
    const response = await askQuestion(message);

    return new Response(JSON.stringify(response), {
      status: 200,
      statusText: "OK",
    });
  } else if (mode === "CREATE-ACCOUNT") {
    const response: acctResProps[] = await createAccount(
      message,
      id as number,
      accountProps
    );

    const { haveError } = response[0];

    return new Response(JSON.stringify(response), {
      status: haveError ? 429 : 200,
      statusText: haveError ? "Bad " : "OK",
    });
  }
};
