// utils/imageUtils.ts
/**
 * Utility functions for standardizing image names based on room data
 */

/**
 * Standardizes a room name to a valid image filename
 * Converts to lowercase, replaces spaces with underscores, removes special characters
 */
export const standardizeImageName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')  // Replace spaces with underscores
    .replace(/\(/g, '_')    // Replace ( with _
    .replace(/\)/g, '_')    // Replace ) with _
    .replace(/[^a-z0-9_]/g, '') // Remove any remaining special characters
    .replace(/_+/g, '_')    // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
};

/**
 * Creates an image path from building and room name
 */
export const createImagePath = (building: string, roomName: string): string => {
  const sanitizedBuilding = standardizeImageName(building);
  const sanitizedRoomName = standardizeImageName(roomName);
  // First try .jpg, then .jpeg
  return `/images/rooms/${sanitizedBuilding}/${sanitizedRoomName}.jpg`;
};

/**
 * Creates an image path with .jpeg extension
 */
export const createImagePathJpeg = (building: string, roomName: string): string => {
  const sanitizedBuilding = standardizeImageName(building);
  const sanitizedRoomName = standardizeImageName(roomName);
  return `/images/rooms/${sanitizedBuilding}/${sanitizedRoomName}.jpeg`;
};

/**
 * Creates an image path trying both .jpg and .jpeg extensions
 */
export const createImagePathWithFallback = (building: string, roomName: string): string => {
  const sanitizedBuilding = standardizeImageName(building);
  const sanitizedRoomName = standardizeImageName(roomName);

  // We'll try both extensions - the image component will handle the fallback
  // by default, try .jpg first
  return `/images/rooms/${sanitizedBuilding}/${sanitizedRoomName}.jpg`;
};

/**
 * Generates expected image paths based on your CSV data
 * This can be used to verify that all images exist
 */
export const generateImagePathsFromCSV = (csvData: string): Array<{building: string, roomName: string, expectedPath: string, expectedPathJpeg: string}> => {
  const lines = csvData.trim().split('\n');
  // Headers: Gedung;Nama Ruangan;Kapasitas
  const headers = lines[0].split(';').map(h => h.trim());

  const imagePaths = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    const building = values[0]?.trim() || '';
    const roomName = values[1]?.trim() || '';

    if (building && roomName) {
      const expectedPath = createImagePath(building, roomName);
      const expectedPathJpeg = createImagePathJpeg(building, roomName);
      imagePaths.push({
        building,
        roomName,
        expectedPath,
        expectedPathJpeg
      });
    }
  }

  return imagePaths;
};

/**
 * Validates that an image follows the naming convention
 */
export const isValidImageName = (filename: string, building: string, roomName: string): boolean => {
  const expectedName = standardizeImageName(roomName);
  const imageWithoutExtension = filename.replace(/\.[^/.]+$/, ""); // Remove extension
  return imageWithoutExtension === expectedName;
};