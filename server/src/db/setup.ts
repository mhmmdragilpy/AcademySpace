import { query } from "./index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeDatabase = async () => {
    try {
        console.log("Initializing database...");
        // Read the SQL schema file
        const schemaPath = path.join(__dirname, "schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");
        console.log("Schema file read. Length:", schema.length);

        // Execute the schema
        await query(schema);
        console.log("Schema executed.");
        logger.info("Database initialized successfully!");
    } catch (error) {
        console.error("Error initializing database:", error);
        logger.error("Error initializing database:", error);
        throw error;
    }
};

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initializeDatabase();
}
