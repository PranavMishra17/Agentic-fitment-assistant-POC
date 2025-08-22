const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building admin dashboard...');

try {
  // Change to admin-dashboard directory and build
  process.chdir('admin-dashboard');
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🔨 Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Go back to root directory
  process.chdir('..');
  
  // Ensure public/admin directory exists
  const adminDir = path.join(process.cwd(), 'public/admin');
  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }
  
  // Copy build files to public/admin
  console.log('📁 Copying build files to public/admin/...');
  execSync('xcopy "admin-dashboard\\build\\*" "public\\admin\\" /E /Y', { stdio: 'inherit' });
  
  console.log('✅ Admin dashboard built successfully!');
  console.log('🌐 Available at: http://localhost:3000/admin');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
