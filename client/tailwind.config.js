/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- Warna Kustom Hex (Sesuai Desain Figma) ---
        'primary-dark': '#021728', // Biru Tua (Nav, Background Gelap Utama)
        'accent-blue': '#66C4FF', // Biru Muda (Aksen, Gradient)
        'secondary-dark': '#1e293b', // Latar Belakang Gelap (ganti dari #0f172a agar lebih umum)
        'soft-blue-bg': '#e0f2ff', // Warna latar belakang terang jika diperlukan
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
      boxShadow: {
        'smooth': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};