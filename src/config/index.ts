import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number.parseInt(process.env.PORT || "3001", 10),
  mongoUri: process.env.MONGO_URI,
  accessToken: process.env.ACCESS_TOKEN_KEY || "gottagenerateasecret",
  resendKey: process.env.RESEND_SECRET_KEY || "missingresendapikey",
  hostEmail: process.env.AUTHOR_EMAIL_ADDRESS || "rsalwesh@gmail.com",
};

export default config;
