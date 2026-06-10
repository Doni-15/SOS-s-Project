import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import authRoutes from "./modules/auth/auth.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import publicOrderRoutes from "./modules/publicOrder/publicOrder.routes.js";
import internalOrderRoutes from "./modules/internalOrder/internalOrder.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import reportRoutes from "./modules/report/report.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import auditLogRoutes from "./modules/auditLog/auditLog.routes.js";
import tableRoutes from "./modules/table/table.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import { notFoundMiddleware } from "./common/middlewares/notFound.middleware.js";
import { errorMiddleware } from "./common/middlewares/error.middleware.js";
import { requestContextMiddleware } from "./common/middlewares/requestContext.middleware.js";

export const app = express();

app.set("trust proxy", 1);

const allowedOrigins = env.corsOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(requestContextMiddleware);
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Self-Order System Management API",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      service: "sos_backend",
      status: "running",
      database: "not_checked",
      environment: env.nodeEnv,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    message: "SOS Backend is running",
  });
});

app.get("/api/health/ready", async (req, res) => {
  try {
    await prisma.$connect();

    res.json({
      success: true,
      data: {
        service: "sos_backend",
        status: "ready",
        database: "connected",
        environment: env.nodeEnv,
        timestamp: new Date().toISOString(),
      },
      message: "SOS Backend is ready",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: "DATABASE_NOT_READY",
        message: "Database is not ready",
        fields:
          env.nodeEnv === "production"
            ? null
            : {
                database: error.message,
              },
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }
});

app.use("/uploads", express.static("public/uploads", { maxAge: "7d" }));
app.use("/api/public", publicOrderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/internal", menuRoutes);
app.use("/api/internal", internalOrderRoutes);
app.use("/api/internal", paymentRoutes);
app.use("/api/internal", userRoutes);
app.use("/api/internal", auditLogRoutes);
app.use("/api/internal", tableRoutes);
app.use("/api/internal", uploadRoutes);

app.use("/api/reports", reportRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
