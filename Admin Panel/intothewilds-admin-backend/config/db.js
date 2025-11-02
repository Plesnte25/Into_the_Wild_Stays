import mongoose from "mongoose";

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI missing");

mongoose
  .connect(uri, { dbName: process.env.MONGO_DB || "itw" })
  .then(() => console.log("Mongo connected"))
  .catch((e) => {
    console.error("Mongo error", e);
    process.exit(1);
  });
