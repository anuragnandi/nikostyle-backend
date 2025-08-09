import { Request, Response, NextFunction } from "express";
import { logError, logWarn } from "../utils/logger";
import { verifyToken } from "../utils/token";

export const authorizeToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    logWarn(
      "POST",
      req.url,
      "middleware::Warning in authorizeToken middleware",
      req.body
    );
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decodedToken = verifyToken(token);
    req.body = decodedToken;
  } catch (error) {
    logError(
      "POST",
      req.url,
      "middleware::Error in authorizeToken middleware",
      req.body,
      error
    );
    return res.status(403).json({ message: "Invalid token" });
  }
  return next();
};
