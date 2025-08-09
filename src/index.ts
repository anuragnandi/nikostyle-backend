import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoute from "./routes/userRoute";

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use("/api", limiter, userRoute);
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "", {
      dbName: "log-pilot-db",
    });
    console.log(`MongoDb connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() =>
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
);
