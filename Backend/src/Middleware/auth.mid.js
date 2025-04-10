import jwt from 'jsonwebtoken';
import { UNAUTHORIZED } from "../Constants/httpStatus.js";
import { connection } from '../server.js';

export const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return res.status(UNAUTHORIZED).json({ message: 'No token provided' });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  };

  export const authenticateSession = (req, res, next) => {
    const sessionId = req.cookies['sessionId']; 
    if (!sessionId) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }
  
    connection.query('SELECT * FROM users WHERE sessionId = ?', [sessionId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Server error" });
      }
  
      const session = results[0];
      const expiry = new Date(session.expiryTime);
      const expiryTime = expiry.getTime();

      if (isNaN(expiryTime)) {
        return res.status(400).json({ message: "Invalid expiry time in database" });
      }

      const now = Date.now();
      if (!session || expiryTime < now) {
        connection.query('DELETE FROM users WHERE sessionId = ?', [sessionId], (deleteErr) => {
          if (deleteErr) {
            console.error("Error removing expired session:", deleteErr);
          }
        });
  
        return res.status(401).json({ message: "Session expired or invalid" });
      }
  
      next();
    });
  };