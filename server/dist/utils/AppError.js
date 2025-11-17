"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
/**
 * Class error kustom untuk membedakan error operasional (bisnis)
 * dari error sistem (programming/bug).
 */
class AppError extends Error {
    /**
     * @param message Pesan error yang akan dikirim ke client
     * @param statusCode Kode status HTTP (e.g., 400, 401, 404)
     */
    constructor(message, statusCode) {
        super(message); // Panggil constructor 'Error'
        this.statusCode = statusCode;
        // Menjaga stack trace (penting untuk debugging)
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
