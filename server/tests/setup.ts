// Test Setup Configuration
// This file runs before all tests
// @ts-nocheck - Disable strict type checking for test file
import { jest, beforeAll, afterAll, beforeEach } from '@jest/globals';

// Set default timeout for all tests
jest.setTimeout(10000);

// Global beforeAll hook
beforeAll(() => {
    // Suppress console.log during tests (optional)
    // jest.spyOn(console, 'log').mockImplementation(() => {});
});

// Global afterAll hook
afterAll(() => {
    // Cleanup after all tests
    jest.restoreAllMocks();
});

// Global beforeEach hook
beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});
