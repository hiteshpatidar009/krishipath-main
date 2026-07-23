import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";

import routes from "./routes";

const app = express();

app.use(helmet());

app.use(cors());

app.use(compression());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "KrishiPath WhatsApp Intelligence Running",
    timestamp: new Date().toISOString(),
  });
});

console.log(typeof notFoundMiddleware);
console.log(typeof errorMiddleware);

app.use(notFoundMiddleware);
app.use("/api", routes);
app.use(errorMiddleware);

export default app;