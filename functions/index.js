/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const cors = require("cors");

const gameTimesRoutes = require("./routes/gametimes");
const groupsRoutes = require("./routes/groups");
const habitsRoutes = require("./routes/habits");
const habitRecordsRoutes = require("./routes/habitRecords");
const gameSessionRoutes = require("./routes/gameSessions");

try {
    require('dotenv').config();
} catch (error) {
    console.log('No .env file found, continuing without it');
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use("/gameTimes", gameTimesRoutes);
app.use("/groups", groupsRoutes);
app.use("/habits", habitsRoutes);
app.use("/habitRecords", habitRecordsRoutes);
app.use("/gameSessions", gameSessionRoutes);

// Export the Express app as a Firebase Cloud Function
exports.api = onRequest(app);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const { createScheduledGameSessions, testCreateGameSessions } = require("./scheduled/createGameSessions");

exports.createScheduledGameSessions = createScheduledGameSessions;
exports.testCreateGameSessions = testCreateGameSessions;
