import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/app.config";
import connectDatabase from "./database/database";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello",
  });
});

app.listen(config.PORT, async () => {
  console.log("server is running", config.PORT);
  await connectDatabase();
});
