import { Schema, model, models } from "mongoose";

export interface recoverAccountProps {
  codes: string[];
  for: string;
  security_question: {
    question: string;
    answer: string;
  };
}

const recoverAccountSchema = new Schema<recoverAccountProps>(
  {
    codes: [String],
    for: String,
    security_question: {
      question: { type: String, select: false },
      answer: { type: String, select: false },
    },
  },
  {
    timestamps: true,
  }
);

export const RecoverAccountModel =
  models?.recoveraccountphrases ??
  model<recoverAccountProps>("recoveraccountphrases", recoverAccountSchema);

export const saveRecoveryPhrases = async ({
  recoveryPhrase,
}: {
  recoveryPhrase: recoverAccountProps;
}) => {
  try {
    const res = await RecoverAccountModel.create(recoveryPhrase);

    Promise.resolve(res);
  } catch (error) {
    Promise.reject(error);
  }
};

export const findRecoveryCode = async (code: string) => {
  const res: recoverAccountProps | null = await RecoverAccountModel.findOne({
    codes: { $in: [code] },
  });

  return res;
};
