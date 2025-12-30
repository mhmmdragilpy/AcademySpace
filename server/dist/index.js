import { app } from "./app.js";
import { query } from "./db/index.js";
import { logger } from "./utils/logger.js";
import { env } from "./config/env.js";
const port = env.PORT;
console.log("Starting server...");
app.listen(port, async () => {
    const msg = `🚀 Server running on http://localhost:${port}`;
    logger.info(msg);
    try {
        await query("SELECT NOW()");
        logger.info("✅ Connected to Database");
    }
    catch (error) {
        logger.error("❌ Failed to connect to Database:", error);
    }
});
//# sourceMappingURL=index.js.map