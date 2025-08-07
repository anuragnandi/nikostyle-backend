import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { Resend } from "resend";
import { logError, logInfo, logWarn } from "../utils/logger";
import { ServiceResponse } from "../types";
import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_SECRET_KEY as string);
const myEmailId = process.env.AUTHOR_EMAIL_ADDRESS as string;

const EmailVerificationService = async (
  email: string,
  subject: string,
  templatePath: string,
  otp: string
): Promise<String> => {
  try {
    const templateFilePath = path.resolve(
      process.cwd(),
      "src",
      "emailTemplates",
      templatePath
    );
    const htmlTemplate = fs.readFileSync(templateFilePath, "utf-8");
    const htmlWithOTP = htmlTemplate.replace("{{OTP}}", otp);
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "oren87@ethereal.email",
        pass: "aUEvSAsJ9eK9RT2eWs",
      },
    });

    // Wrap in an async IIFE so we can use await.
    const info = await transporter.sendMail({
      from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
      to: "oren87@ethereal.email",
      subject: subject,
      text: "Hello world?", // plain‑text body
      html: htmlWithOTP, // HTML body
    });
    // const response = await resend.emails.send({
    //   from: myEmailId,
    //   to: email,
    //   subject: subject,
    //   html: htmlWithOTP,
    // });

    if (!info || !info.response.startsWith("250")) {
      logWarn(
        "POST",
        "",
        "service::EmailVerificationService::email response",
        JSON.stringify({ email, subject, templatePath, info })
      );
      return ServiceResponse.FAILURE;
    }
    logInfo(
      "POST",
      "",
      "service::EmailVerificationService::email response",
      JSON.stringify({ email, subject, templatePath, info })
    );
    return ServiceResponse.SUCCESS;
  } catch (error) {
    logError(
      "POST",
      "",
      "service::EmailVerificationService::email response",
      JSON.stringify({ email, subject, templatePath }),
      error
    );
    return ServiceResponse.FAILURE;
  }
};

export default EmailVerificationService;
