import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { connection } from "../server.js";
import { authenticateJWT, authenticateSession } from "../Middleware/auth.mid.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const sessionId = uuidv4();

    const accessToken = jwt.sign({ id: user.name }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user.name }, process.env.REFRESH_KEY, {
      expiresIn: "30d",
    });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiryTime = expiresAt.toISOString().slice(0, 19).replace('T', ' '); 

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
            .status(500)
            .json({ error: "Database error while updating session" });
        }
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ name: user.name, accessToken, email: user.email });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ accessToken: newAccessToken });
  });
});

router.get("/dashboard", authenticateJWT, authenticateSession, (req, res) => {
  res.json({ message: "Welcome to the dashboard", user: req.user });
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
  console.log("relocate", relocate);

  try {
    const canRelocate = relocate === true || relocate === "true" ? "Yes" : "No";

    const emailCheckQuery =
      "SELECT * FROM employee_registration WHERE email = ?";
    const mobileCheckQuery =
      "SELECT * FROM employee_registration WHERE mobile = ?";

    connection.query(emailCheckQuery, [email], (emailErr, emailResults) => {
      if (emailErr)
        return res.status(500).json({ error: "Server error", status: false });

      if (emailResults.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      connection.query(
        mobileCheckQuery,
        [mobile],
        (mobileErr, mobileResults) => {
          if (mobileErr) return res.status(500).json({ error: "Server error" });

          if (mobileResults.length > 0) {
            return res
              .status(400)
              .json({ error: "Mobile number already exists" });
          }

          const insertQuery = `
          INSERT INTO employee_registration 
          (name, email, mobile, degree, department, degree_percentage, sslc_percentage, hsc_percentage, location, relocate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            ],
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error(insertErr);
                return res.status(500).json({ error: "Database error" });
              }

              res
                .status(201)
                .json({
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
    res.status(500).json({ error: "Server error" });
  }
});

setInterval(() => {
  const currentTime = Date.now();

  connection.query('SELECT * FROM users WHERE expiryTime < ?', [currentTime], (err, results) => {
    if (err) {
      console.error("Error checking for expired sessions:", err);
    } else {
      if (results.length > 0) {
        results.forEach(session => {
          const expiryTime = new Date(session.expiryTime).getTime();
          if (isNaN(expiryTime)) {
            console.error("Invalid expiry time in database for session:", session.sessionId);
          } else if (expiryTime < currentTime) {
            connection.query('DELETE FROM users WHERE sessionId = ?', [session.sessionId], (deleteErr) => {
              if (deleteErr) {
                console.error("Error removing expired session:", deleteErr);
              } else {
                console.log(`Deleted expired session with sessionId: ${session.sessionId}`);
              }
            });
          }
        });
      }
    }
  });
}, 60 * 60 * 1000);


router.post("/logout", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  connection.query('UPDATE users SET sessionId = NULL, expiryTime = NULL WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error("Error updating session info:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("sessionId");
    res.sendStatus(200);
  });
});


router.get("/employees", authenticateJWT, authenticateSession, (req, res) => {
  const query = "SELECT * FROM employee_registration";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(500).json({ error: "Server error" });
    }

    res.status(200).json({ employees: results });
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

async function findUserById(id) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM users WHERE id = ?",
      [id],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      }
    );
  });
}

export default router;
