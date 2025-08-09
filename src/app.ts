import express, { Application } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoute from "./routes/userRoute";
import config from "./config/index";
import { connectDB } from "./config/db";
const app: Application = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  })
);

app.use(cors());

//Routes
app.use("/api", userRoute);

//Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

const PORT = config.port;
console.log(`Environment PORT: ${PORT}`);

connectDB().then(() =>
  app.listen(PORT, "0.0.0.0/0", () => {
    console.log(`Server running on port ${PORT}`);
  })
);

export default app;
