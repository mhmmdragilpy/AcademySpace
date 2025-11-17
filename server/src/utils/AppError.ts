/**
 * Class error kustom untuk membedakan error operasional (bisnis)
 * dari error sistem (programming/bug).
 */
export class AppError extends Error {
  public statusCode: number;

  /**
   * @param message Pesan error yang akan dikirim ke client
   * @param statusCode Kode status HTTP (e.g., 400, 401, 404)
   */
  constructor(message: string, statusCode: number) {
    super(message); // Panggil constructor 'Error'
    this.statusCode = statusCode;

    // Menjaga stack trace (penting untuk debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}
