/*
 * ========================================
 * FILE: server/prettier.config.js (GANTI DARI .prettierrc)
 * ========================================
 */
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'auto',
  // Ini memberitahu Prettier untuk tidak mencoba memformat HTML/XML yang sering ada di .d.ts
  htmlWhitespaceSensitivity: 'ignore', 
};