import rateLimit from "express-rate-limit";
import { Request } from "express";

// Normalize IPv6 manually like ipKeyGenerator does
const normalizeIp = (req: Request): string | undefined => {
  const ip = req.ip;
  if (ip?.startsWith("::ffff:")) return ip.substring(7); // strip IPv6 prefix
  return ip;
};

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req: Request) => {
    const email = req.body?.email;
    return email ? `email:${email}` : `ip:${normalizeIp(req)}`;
  },
  message: {
    message: "Too many OTP requests. Please wait 10 minutes and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
