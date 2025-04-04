import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateTokenResponse } from "../Token/Token.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
 
  try {
    let user = await findUserByEmail(email);
   
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    console.log(user);
 
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

  try {
    const emailCheckQuery = 'SELECT * FROM employee_registration WHERE email = ?';
    const mobileCheckQuery = 'SELECT * FROM employee_registration WHERE mobile = ?';

    db.query(emailCheckQuery, [email], (emailErr, emailResults) => {
      if (emailErr) return res.status(500).json({ error: 'Server error' , status: false});

      if (emailResults.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      db.query(mobileCheckQuery, [mobile], (mobileErr, mobileResults) => {
        if (mobileErr) return res.status(500).json({ error: 'Server error' });

        if (mobileResults.length > 0) {
          return res.status(400).json({ error: 'Mobile number already exists' });
        }

        const insertQuery = `
          INSERT INTO employee_registration 
          (name, email, mobile, degree, department, degree_percentage, sslc_percentage, hsc_percentage, location, relocate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertQuery,
          [name, email, mobile, degree, department, degree_percentage, sslc_percentage, hsc_percentage, location, relocate],
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
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

router.get("/employees", (req, res) => {
  const query = "SELECT * FROM employee_registration";

  db.query(query, (err, results) => {
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

export default router;
