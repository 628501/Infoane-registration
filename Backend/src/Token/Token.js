import jwt from 'jsonwebtoken';
import dotenv from "dotenv"


dotenv.config()
const SECRET_ACCESS = 'access_secret';
const SECRET_REFRESH = 'refresh_secret';
export const generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user.id, username: user.name }, SECRET_ACCESS, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, SECRET_REFRESH, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  };
