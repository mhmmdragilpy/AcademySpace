/*
 * ========================================
 * FILE: client/postcss.config.js (KODE PALING STABIL)
 * ========================================
 */
module.exports = {
  // Menggunakan array untuk menjamin urutan eksekusi plugin
  plugins: [
    // 1. PostCSS Nesting (diperlukan untuk @layer components)
    'postcss-nesting',
    // 2. Tailwind CSS (harus dimuat sebelum Autoprefixer)
    'tailwindcss',
    // 3. Autoprefixer
    'autoprefixer',
  ],
};