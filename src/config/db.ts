import mongoose from "mongoose";
import config from "./index";
import logger from "../utils/logger";

export const connectDB = async () => {
  if (!config.mongoUri) {
    logger.error("Mongo URI is missing");
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      dbName: "log-pilot-db",
    });
    logger.info(`MongoDb connected: ${conn.connection.host}`);
    console.log(`MongoDb connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    logger.error(`Mongo connection error: ${error}`);
  }
};
