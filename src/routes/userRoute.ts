import {
  authenticateOtp,
  fakeApiCheck,
  generateOtp,
  resetPassword,
  userCreate,
  userLogin,
} from "../controllers/userController";
import express from "express";
import { authorizeToken } from "../middleware/auth";
import { otpLimiter } from "../middleware/otp-rate-limiter";

const router = express.Router();

router.post("/signup", userCreate);
router.post("/login", userLogin);
router.get("/fetchEmail", authorizeToken, fakeApiCheck);
router.post("/forgotPassword", resetPassword);
router.post("/generateOtp", otpLimiter, generateOtp);
router.post("/authenticateOtp", authenticateOtp);

export default router;
