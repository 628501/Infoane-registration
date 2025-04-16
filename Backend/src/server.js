import express from "express";
import cors from "cors";
import userRouter from "./Routers/user.Router.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mysql from "mysql2";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Mysql Connected");
  }
});

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [process.env.LOCAL, process.env.IP, process.env.PROD],
  })
);

app.use("/api/users", userRouter);

const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

app.all("/{*any}", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
