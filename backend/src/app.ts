import cors from "cors";
import express from "express";
import path from "path";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import routes from "./routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);
