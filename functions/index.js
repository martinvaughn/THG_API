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

const gametimesRoutes = require("./routes/gametimes");
const groupsRoutes = require("./routes/groups");
const habitsRoutes = require("./routes/habits");
const habitRecordsRoutes = require("./routes/habitRecords");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use("/gametimes", gametimesRoutes);
app.use("/groups", groupsRoutes);
app.use("/habits", habitsRoutes);
app.use("/habitRecords", habitRecordsRoutes);

// Export the Express app as a Firebase Cloud Function
exports.api = onRequest(app);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
