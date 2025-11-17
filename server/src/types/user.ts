/**
 * Mendefinisikan struktur objek User sesuai dengan
 * tabel 'users' di database kita.
 */
export interface User {
  user_id: number;
  email: string;
  password_hash: string; // Kita sertakan di sini untuk tipe, meski tidak dikirim ke client
  full_name: string;
  role: 'admin' | 'staff' | 'user'; // Sesuai ENUM di SQL
  profile_picture_url?: string;
  created_at: string; // Tipe 'string' aman untuk data timestamptz dari DB
  last_login_at?: string;
}
