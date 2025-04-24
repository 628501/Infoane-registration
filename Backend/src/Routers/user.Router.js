import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { connection } from "../server.js";
import {
  authenticateJWT,
  authenticateSession,
} from "../Middleware/auth.mid.js";

import {
  BAD_REQUEST,
  SERVER_ERROR,
  STATUS_OK,
  UNAUTHORIZED,
} from "../Constants/httpStatus.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "Email and password are required" });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(UNAUTHORIZED).json({ error: "Invalid credentials" });
    }
    const sessionId = uuidv4();
    const accessToken = jwt.sign({ id: user.name }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign({ id: user.name }, process.env.REFRESH_KEY, {
      expiresIn: "30d",
    });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiryTime = expiresAt.toISOString().slice(0, 19).replace("T", " ");

    const updateQuery = `
    UPDATE users SET sessionId = ?, expiryTime = ? WHERE email = ?
  `;
    connection.query(
      updateQuery,
      [sessionId, expiryTime, email],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error(updateErr);
          return res
            .status(SERVER_ERROR)
            .json({ error: "Database error while updating session" });
        }
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.json({ name: user.name, accessToken, email: user.email });
  } catch (err) {
    console.error("Login error:", err);
    res.status(SERVER_ERROR).json({ error: "Internal server error" });
  }
});

router.get(
  "/check-auth",
  authenticateJWT,
  authenticateSession,
  async (req, res) => {
    if (req.user && req.jwtUser) {
      return res
        .status(STATUS_OK)
        .json({ authorized: true, name: req.jwtUser, email: req.user });
    }
    return res.status(UNAUTHORIZED).json({ authorized: false });
  }
);

router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(UNAUTHORIZED);

  jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, user) => {
    if (err) return res.sendStatus(UNAUTHORIZED);

    const newAccessToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.json({ accessToken: newAccessToken });
  });
});

router.post("/register", async (req, res) => {
  const {
    name,
    email,
    mobile,
    degree,
    department,
    degree_percentage,
    sslc_percentage,
    hsc_percentage,
    location,
    relocate,
  } = req.body;

  try {
    const canRelocate = relocate === true || relocate === "true" ? "Yes" : "No";
    const formattedDate = new Date().toLocaleDateString("en-GB").split("/").join("-");

    const emailCheckQuery =
      "SELECT * FROM candidate_registration WHERE email = ?";
    const mobileCheckQuery =
      "SELECT * FROM candidate_registration WHERE mobile = ?";

    connection.query(emailCheckQuery, [email], (emailErr, emailResults) => {
      if (emailErr)
        return res
          .status(SERVER_ERROR)
          .json({ error: "Server error", status: false });

      if (emailResults.length > 0) {
        return res.status(BAD_REQUEST).json({ error: "Email already exists" });
      }

      connection.query(
        mobileCheckQuery,
        [mobile],
        (mobileErr, mobileResults) => {
          if (mobileErr)
            return res.status(SERVER_ERROR).json({ error: "Server error" });

          if (mobileResults.length > 0) {
            return res
              .status(BAD_REQUEST)
              .json({ error: "Mobile number already exists" });
          }

          const insertQuery = `
          INSERT INTO candidate_registration 
          (name, email, mobile, degree, department, degree_percentage, sslc_percentage, hsc_percentage, location, relocate, submitted_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

          connection.query(
            insertQuery,
            [
              name,
              email,
              mobile,
              degree,
              department,
              degree_percentage,
              sslc_percentage,
              hsc_percentage,
              location,
              canRelocate,
              formattedDate
            ],
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error(insertErr);
                return res
                  .status(SERVER_ERROR)
                  .json({ error: "Database error" });
              }

              res.status(STATUS_OK).json({
                message: "Registration successful",
                id: insertResult.insertId,
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(SERVER_ERROR).json({ error: "Server error" });
  }
});

setInterval(() => {
  const currentTime = Date.now();

  connection.query(
    "SELECT * FROM users WHERE expiryTime < ?",
    [currentTime],
    (err, results) => {
      if (err) {
        console.error("Error checking for expired sessions:", err);
      } else {
        if (results.length > 0) {
          results.forEach((session) => {
            const expiryTime = new Date(session.expiryTime).getTime();
            if (isNaN(expiryTime)) {
              console.error(
                "Invalid expiry time in database for session:",
                session.sessionId
              );
            } else if (expiryTime < currentTime) {
              connection.query(
                "DELETE FROM users WHERE sessionId = ?",
                [session.sessionId],
                (deleteErr) => {
                  if (deleteErr) {
                    console.error("Error removing expired session:", deleteErr);
                  } else {
                    console.log(
                      `Deleted expired session with sessionId: ${session.sessionId}`
                    );
                  }
                }
              );
            }
          });
        }
      }
    }
  );
}, 60 * 60 * 1000);

router.post("/logout", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(BAD_REQUEST).json({ message: "Email is required" });
  }
  connection.query(
    "UPDATE users SET sessionId = NULL, expiryTime = NULL WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error updating session info:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.clearCookie("sessionId");
      res.sendStatus(STATUS_OK);
    }
  );
});

router.get("/candidate", authenticateJWT, authenticateSession, (req, res) => {
  const query = "SELECT * FROM candidate_registration";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(SERVER_ERROR).json({ error: "Server error" });
    }

    res.status(STATUS_OK).json({ employees: results });
  });
});

async function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      }
    );
  });
}

export default router;
