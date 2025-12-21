console.log("Starting server..."); // Direct feedback
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { query, pool } from "./db/index.js";
import apiRoutes from "./routes/index.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

dotenv.config();

import { env } from "./config/env.js";

const app = express();
const port = env.PORT;

// Trust Proxy for Heroku/Docker/Nginx
app.set('trust proxy', 1);

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
}));
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
            connectSrc: ["'self'", env.CLIENT_URL, "http://localhost:3000"],
            frameSrc: ["'self'", env.CLIENT_URL, "blob:"],
            frameAncestors: ["'self'", env.CLIENT_URL],
        },
    })
);

// Allow multiple frontend origins for development
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Rate Limiting
app.use("/api", apiLimiter);

// Routes
app.use("/api", apiRoutes);

// Health check route
app.get("/api/health", async (req, res, next) => {
    try {
        // Test database connection
        const result = await query("SELECT COUNT(*) FROM users");
        const db_users_count = parseInt(result.rows[0].count);

        res.json({
            status: "success",
            message: "Server connected to Database!",
            data: { db_users_count }
        });
    } catch (error) {
        next(error);
    }
});

// Global Error Handler
app.use(errorHandler);

app.listen(port, async () => {
    const msg = `🚀 Server running on http://localhost:${port}`;
    logger.info(msg);

    try {
        await query("SELECT NOW()");
        logger.info("✅ Connected to Database");
    } catch (error) {
        logger.error("❌ Failed to connect to Database:", error);
    }
});