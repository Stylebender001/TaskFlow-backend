import mongoose from "mongoose";

export default function () {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(console.log("Connected to MongoDb.."))
    .catch((err) => console.log("Error connecting to MongoDb: ", err));
}
