import jwt from "jsonwebtoken";
import config from "../config/index";

export const createAccessToken = (id: string) => {
  return jwt.sign({ userId: id }, config.accessToken, {
    expiresIn: "90d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.accessToken);
};
