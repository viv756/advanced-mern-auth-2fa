import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config";
import connectDatabase from "./database/database";
import { errorHandler } from "./middlewares/errorhandler";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";

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

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Hello",
    });
  })
);

// error handler
app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log("server is running", config.PORT);
  await connectDatabase();
});
