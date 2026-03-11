const fs = require('fs');
const path = require('path');

// Clean up all browser sessions
const authPath = './.wwebjs_auth';

console.log('🧹 Cleaning up browser sessions...');

try {
  if (fs.existsSync(authPath)) {
    fs.rmSync(authPath, { recursive: true, force: true });
    console.log('✅ Cleaned up:', authPath);
  } else {
    console.log('No sessions to clean');
  }
} catch (error) {
  console.error('Error cleaning up:', error);
}

console.log('✨ Done! Restart the server now.');
