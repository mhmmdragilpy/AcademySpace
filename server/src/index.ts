console.log("Starting server..."); // Direct feedback
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { query } from "./db/index.js";
import apiRoutes from "./routes/index.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

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
            connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001", "http://localhost:5000"],
            frameSrc: ["'self'", "http://localhost:5000", "http://localhost:3000", "http://localhost:3001", "blob:"],
            frameAncestors: ["'self'", "http://localhost:3000", "http://localhost:3001"],
        },
    })
);

// Allow multiple frontend origins for development
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, true); // Allow all for development
    },
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
    console.log(msg); // Ensure visible in terminal
    logger.info(msg);

    try {
        await query("SELECT NOW()");
        console.log("✅ Connected to Database"); // Ensure visible in terminal
        logger.info("✅ Connected to Database");
    } catch (error) {
        console.error("❌ Failed to connect to Database:", error);
        logger.error("❌ Failed to connect to Database:", error);
    }
});