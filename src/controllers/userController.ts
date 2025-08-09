import { Request, Response } from "express";
import User from "../models/userModel";
import { logError, logInfo, logWarn } from "../utils/logger";
import bcrypt from "bcrypt";
import { createAccessToken } from "../utils/token";
import { generateOTP } from "../utils/helper";
import EmailVerificationService from "../services/EmailVerificationService";
import { ServiceResponse } from "../types/ServiceResponseType";
import Otp from "../models/otpModel";

export const userCreate = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const userCheck = await User.findOne({ email });
    if (userCheck) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::warning in userCreate api",
        req.body
      );
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    if (user) {
      logInfo(
        "POST",
        "controller::userController::success in userCreate api",
        req.url,
        req.body
      );
      return res.status(200).json({ message: "User created successfully" });
    }
    return res.status(500).json({ message: "Unable to create user" });
  } catch (error) {
    logError(
      "POST",
      req.url,
      "controller::userController::error in userCreate api",
      req.body,
      error
    );
    return res.status(500).json({ message: "Error creating user", error });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::warning in userLogin api",
        req.body
      );
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::warning in userLogin api",
        req.body
      );
      return res.status(401).json({ message: "Invalid password" });
    }
    const accessToken = createAccessToken(user._id);
    logInfo(
      "POST",
      req.url,
      "controller::userController::success in userLogin api",
      req.body
    );
    return res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      admin: user.admin,
    });
  } catch (error) {
    logError(
      "POST",
      req.url,
      "controller::userController::error in userLogin api",
      req.body,
      error
    );
    return res.status(500).json({ message: "Error logging in user", error });
  }
};

export const fakeApiCheck = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      logWarn(
        "GET",
        req.url,
        "controller::userController::warning in fake api",
        req.body
      );
      return res.status(404).json({ message: "User not found" });
    }
    logInfo(
      "GET",
      req.url,
      "controller::userController::success in fake api",
      req.body
    );
    return res.json({ message: `user email: ${user.email}` });
  } catch (error) {
    logError(
      "GET",
      req.url,
      req.body,
      "controller::userController::error in fake api",
      error
    );
    return res.status(500).json({ message: "Error calling fake api", error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::warning in resetPasssword api",
        req.body
      );
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updateUser = await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });
    if (updateUser) {
      logInfo(
        "POST",
        req.url,
        "controller::userController::success in resetPasssword api",
        req.body
      );
      return res.status(200).json({ message: "Password reset successfully" });
    }
    return res.status(500).json({ message: "Unable to reset password" });
  } catch (error) {
    logError(
      "POST",
      req.url,
      "controller::userController::error in resetPasssword api",
      req.body,
      error
    );
    return res.status(500).json({ message: "Error resetting password" });
  }
};

export const generateOtp = async (req: Request, res: Response) => {
  try {
    const { email, purpose } = req.body;

    const userCheck = await User.findOne({ email });
    if (!userCheck && purpose === "forgot-password") {
      logWarn(
        "POST",
        req.url,
        "controller::userController::warning in generate api",
        req.body
      );
      return res.status(404).json({ message: "User not found" });
    }

    if (!email || !purpose) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::missing email or purpose in generateOtp",
        req.body
      );
      return res.status(400).json({ error: "Email and purpose required" });
    }

    if (!["signup", "forgot-password"].includes(purpose)) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::invalid purpose in generateOtp",
        req.body
      );
      return res.status(400).json({ error: "Invalid purpose" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await Otp.create({ email, otp, expiresAt });

    logInfo(
      "POST",
      req.url,
      "controller::userController::OTP generated and stored",
      req.body
    );

    const template =
      purpose === "signup"
        ? "signup-verification.html"
        : "forgot-password.html";

    const response = await EmailVerificationService(
      email,
      purpose === "signup"
        ? "Email verification for Signup"
        : "Email verification for password reset",
      template,
      otp
    );

    if (response !== ServiceResponse.SUCCESS) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::failed to send OTP email",
        req.body
      );
      return res
        .status(503)
        .json({ message: "Unable to send verification email" });
    }

    logInfo(
      "POST",
      req.url,
      "controller::userController::OTP email sent successfully",
      req.body
    );

    return res.status(200).json({ message: "OTP sent", email });
  } catch (error) {
    logError(
      "POST",
      req.url,
      "controller::userController::error in generateOtp api",
      req.body,
      error
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const authenticateOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::missing email or otp in authenticateOtp",
        req.body
      );
      return res.status(400).json({ error: "Email and otp required" });
    }

    const otpData = await Otp.findOne({ email }).sort({ expiresAt: -1 }).exec();

    if (!otpData) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::OTP not found for email",
        req.body
      );
      return res.status(404).json({ message: "No OTP found" });
    }

    if (new Date(Date.now()) > otpData.expiresAt) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::OTP expired",
        req.body
      );
      return res.status(410).json({ message: "OTP expired" });
    }

    if (otpData.otp !== otp) {
      logWarn(
        "POST",
        req.url,
        "controller::userController::Invalid OTP provided",
        req.body
      );
      return res.status(401).json({ message: "Invalid OTP" });
    }

    await Otp.deleteMany({ email });

    logInfo(
      "POST",
      req.url,
      "controller::userController::OTP verified and deleted",
      req.body
    );

    return res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    logError(
      "POST",
      req.url,
      "controller::userController::error in authenticateOtp api",
      req.body,
      error
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
