import express from "express";
import cors from "cors";
import userRouter from "./Routers/user.Router.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
