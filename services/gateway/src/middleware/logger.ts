import morgan from "morgan";
import { Request, Response } from "express";

// Custom log format
const logFormat =
  ":method :url :status :res[content-length] - :response-time ms";

// Development mein colored logs
const logger = morgan(logFormat, {
  skip: (req: Request, res: Response) => {
    // Health checks ko log mat karo (noise kam karo)
    return req.url === "/health";
  },
  stream: {
    write: (message: string) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${message.trim()}`);
    },
  },
});

export default logger;
