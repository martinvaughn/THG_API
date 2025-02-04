const admin = require('firebase-admin');

// Initialize Firebase Admin
if (process.env.FUNCTIONS_EMULATOR) {
  // Running in emulator
  admin.initializeApp({
    projectId: 'thehabitgame-63ae7'
  });
} else {
  // Running in production
  admin.initializeApp();
}

const db = admin.firestore();

// If running in emulator, point to the emulator
if (process.env.FUNCTIONS_EMULATOR) {
  db.settings({
    host: 'localhost:8080',
    ssl: false
  });
}

module.exports = { db, admin }; 