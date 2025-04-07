import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateTokenResponse } from "../Token/Token.js";
import { connection } from "../server.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password, token } = req.body;
  try {
    let user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user.token !== token) {
      return res.status(401).json({ error: "Invalid token" });
    }

    connection.query("SELECT * FROM login WHERE email = ?", [email], (loginErr, loginResults) => {
      if (loginErr) {
        return res.status(500).json({ error: "Server error" });
      }

      if (loginResults.length > 0) {
        connection.query(
          "UPDATE login SET token = ? WHERE email = ?",
          [token, email],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ error: "Failed to update token" });
            }
          }
        );
      } else {
        connection.query(
          "INSERT INTO login (email, token) VALUES (?, ?)",
          [email, token],
          (insertErr) => {
            if (insertErr) {
              return res.status(500).json({ error: "Failed to insert token" });
            }
          }
        );
      }

      const tokenResponse = generateTokenResponse(user);

      if (!tokenResponse || !tokenResponse.token) {
        throw new Error("Token generation failed");
      }

      res.cookie("token", tokenResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        token: tokenResponse.token,
        id: user.id,
        name: user.name,
        emailId: user.email,
        auth: user.isAuthorised,
      });
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/register', async (req, res) => {
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
  console.log("relocate" , relocate);
  
  try {
    const canRelocate = relocate === true || relocate === "true" ?   "Yes" : "No";
    
    const emailCheckQuery = 'SELECT * FROM employee_registration WHERE email = ?';
    const mobileCheckQuery = 'SELECT * FROM employee_registration WHERE mobile = ?';

    connection.query(emailCheckQuery, [email], (emailErr, emailResults) => {
      if (emailErr) return res.status(500).json({ error: 'Server error' , status: false});

      if (emailResults.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      connection.query(mobileCheckQuery, [mobile], (mobileErr, mobileResults) => {
        if (mobileErr) return res.status(500).json({ error: 'Server error' });

        if (mobileResults.length > 0) {
          return res.status(400).json({ error: 'Mobile number already exists' });
        }

        const insertQuery = `
          INSERT INTO employee_registration 
          (name, email, mobile, degree, department, degree_percentage, sslc_percentage, hsc_percentage, location, relocate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(
          insertQuery,
          [name, email, mobile, degree, department, degree_percentage, sslc_percentage, hsc_percentage, location, canRelocate],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error(insertErr);
              return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({ message: 'Registration successful', id: insertResult.insertId });
          }
        );
      });
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post("/logout", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  connection.query(
    "UPDATE login SET token = NULL WHERE email = ?",
    [email],
    (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error clearing token:", updateErr);
        return res.status(500).json({ error: "Server error" });
      }
      res.clearCookie("token");
      res.status(200).json({ message: "Logout successful" });
    }
  );
});


router.get("/employees", (req, res) => {
  const query = "SELECT * FROM employee_registration";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(500).json({ error: "Server error" });
    }

    res.status(200).json({ employees: results });
  });
});

router.post("/get-token", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  connection.query("SELECT token FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Error fetching token:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Email not found in users table" });
    }

    const userToken = results[0].token;
    res.status(200).json({ token: userToken });
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
