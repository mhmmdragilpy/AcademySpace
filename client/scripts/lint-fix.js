// File: client/scripts/lint-fix.js (PERBAIKAN)
const { execSync } = require('child_process');

try {
  // Panggil perintah linting Next.js secara langsung pada folder 'src'
  console.log('Running Next.js lint check on src directory...');
  // --- PERBAIKAN: MENGHAPUS '--fix' ---
  execSync('npx next lint src', { stdio: 'inherit' }); 
  // ------------------------------------
  
  console.log('\nLinting complete. Running Prettier format...');
  execSync('npx prettier --write "src/**/*.{ts,tsx,js,jsx}"', { stdio: 'inherit' });

  console.log('\n✅ Frontend code quality check finished successfully.');

} catch (error) {
  console.error('\n❌ ESLint/Format failed. Please check the reported errors above.');
  process.exit(1);
}