import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  console.log(
    `[REQUEST RECEIVED] Method: ${req.method} URL: ${req.url} OriginalURL: ${req.originalUrl}`
  );

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const type = status >= 400 ? "FAILED" : "SUCCESS";
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type} ${req.method} ${
      req.originalUrl || req.url
    } Status:${status} ${duration}ms\n`;

    fs.appendFile(path.join(__dirname, "../../logs.text"), logMessage, (err) => {
      if (err) console.error("Failed to write to logs.text:", err);
    });

    if (status >= 400) {
      console.log(
        `[RESPONSE SENT] ${type} ${req.method} ${req.originalUrl} Status:${status}`
      );
    }
  });

  next();
}
