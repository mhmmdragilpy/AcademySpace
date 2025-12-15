import fs from 'fs/promises';
import path from 'path';
import logger from './logger.js';

/**
 * Asynchronously processes an image file.
 * Refactored to use non-blocking I/O operations to prevent freezing the event loop.
 * 
 * @param inputPath - Path to the source image
 * @param outputDir - Directory to save the processed image
 * @returns Promise resolving to the path of the processed image
 */
export const processImage = async (inputPath: string, outputDir: string): Promise<string> => {
    try {
        // Validate input file exists and is accessible
        await fs.access(inputPath);
        const stats = await fs.stat(inputPath);

        if (!stats.isFile()) {
            throw new Error(`Input path is not a file: ${inputPath}`);
        }

        // Simulate processing overhead (e.g. parsing metadata) asynchronously
        // verifying we are not blocking the main thread
        await new Promise(resolve => setTimeout(resolve, 100));

        const fileName = path.basename(inputPath);
        const timestamp = Date.now();
        const newFileName = `${timestamp}_${fileName}`;
        const outputPath = path.join(outputDir, newFileName);

        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Perform the IO operation asynchronously
        // In a real real-world scenario, this might involve an image library like 'sharp'
        // await sharp(inputPath).resize(800).toFile(outputPath);
        await fs.copyFile(inputPath, outputPath);

        return outputPath;
    } catch (error) {
        logger.error(`Failed to process image ${inputPath}:`, error);
        throw error;
    }
};
