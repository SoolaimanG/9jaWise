import mongoose from "mongoose";

export const connectDatabase = async () =>
  mongoose
    .connect(process.env.MONGODB_URI as string, {
      //socketTimeoutMS: 3000,
      maxPoolSize: 150,
    })
    .then(() => {
      console.log("Connection established");
    })
    .catch((err) => {
      console.log(err);
    });

export const closeConnection = async () => {
  mongoose.connection
    .close()
    .then(() => {
      console.log("Connection closed");
    })
    .catch((err) => {
      console.log("Failed to close connection" + err);
    });
};
