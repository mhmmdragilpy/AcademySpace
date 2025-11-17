/*
 * ========================================
 * FILE: server/src/types/express.d.ts (FILE BARU)
 * LOKASI: server/src/types/express.d.ts
 * ========================================
 */

// File ini "menambahkan" (augmenting) properti 'user'
// ke tipe 'Request' global dari Express.

// Tipe data User dari payload token JWT kita
interface UserPayload {
  id: number;
  email: string;
  role: string;
}

// Deklarasi global untuk 'namespace' Express
declare global {
  namespace Express {
    // Kita tambahkan 'user' ke interface 'Request'
    export interface Request {
      user?: UserPayload; // Menambahkan 'user' sebagai properti opsional
    }
  }
}

// Menambahkan 'export {}' kosong di bawah ini
// mengubah file ini dari 'script' menjadi 'module'
// Ini penting agar 'declare global' berfungsi dengan benar.
export {};
