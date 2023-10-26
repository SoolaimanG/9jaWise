import { models, model, Schema } from "mongoose";

export interface amNotARobotType {
  requestedBy: string | number;
  amNotARobotToken: string;
}

const amNotARobotSchema = new Schema<amNotARobotType>({
  requestedBy: String,
  amNotARobotToken: String,
});

export const amNotARobotModal =
  models?.amnotaroboot ??
  model<amNotARobotType>("amnotaroboot", amNotARobotSchema);

//Helpers

export const findAmNotARobotByToken = async (token: string) => {
  const res = await amNotARobotModal.findOne({ amNotARobotToken: token });

  return res;
};

export const findAmNotARobotByRequestedBy = async (
  requestedBy: string | number
) => {
  const res = await amNotARobotModal.findOne({ requestedBy: requestedBy });

  return res;
};

export const addTokenToDB = async (
  token: string,
  requestedBy: string | number
) => {
  const data = new amNotARobotModal<amNotARobotType>({
    requestedBy,
    amNotARobotToken: token,
  });

  const res = await data.save();

  return res;
};

export const updateAmNotARobot = async (
  requestedBy: string | number,
  amNotARobotToken: string
) => {
  const res = await amNotARobotModal.findOneAndUpdate(
    { requestedBy },
    { amNotARobotToken }
  );

  return res;
};
