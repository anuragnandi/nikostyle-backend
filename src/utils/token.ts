import jwt from "jsonwebtoken";

export const createAccessToken = (id: string) => {
  return jwt.sign({ userId: id }, process.env.ACCESS_TOKEN_KEY as string, {
    expiresIn: "90d",
  });
};

export const createRefreshToken = (id: string) => {
  return jwt.sign({ userId: id }, process.env.REFRESH_TOKEN_KEY as string, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_KEY as string);
};
