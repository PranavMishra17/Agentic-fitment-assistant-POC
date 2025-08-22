const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development servers...');

// Start the main server
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for backend to start
setTimeout(() => {
  console.log('⚛️  Starting React admin dashboard...');
  const frontend = spawn('npm', ['start'], {
    cwd: path.join(process.cwd(), 'admin-dashboard'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, BROWSER: 'none' } // Don't auto-open browser
  });

  frontend.on('close', (code) => {
    console.log(`React app exited with code ${code}`);
  });
}, 3000);

backend.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  backend.kill();
  process.exit();
});
