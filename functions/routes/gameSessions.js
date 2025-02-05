const express = require("express");
const { db } = require("../utils/db");
const { authenticate } = require("../utils/auth");
const GameSession = require("../models/Gamesession");

const router = express.Router();
const gameSessionsCollection = "gameSessions";

/**
 * 📌 Fetch Active GameSessions (for the Home Screen)
 */
router.get("/active", authenticate, async (req, res) => {
    try {
        const now = new Date().toISOString();

        const snapshot = await db
            .collection(gameSessionsCollection)
            .where("userId", "==", req.user.uid)
            .where("status", "==", "pending")
            .where("expiresAt", ">", now) // Only get sessions that are still valid
            .orderBy("expiresAt", "asc")
            .get();

        const activeSessions = snapshot.docs.map((doc) => GameSession.fromFirestore(doc));
        return res.json(activeSessions);
    } catch (error) {
        console.error("Error fetching active game sessions:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});



/**
 * 📌 Create a Test GameSession that expires in 1 week
 */
router.post("/create-test-session", authenticate, async (req, res) => {
    try {
        const { gameTimeId } = req.body;
        if (!gameTimeId) {
            return res.status(400).json({ error: "GameTime ID is required" });
        }

        // Look up the GameTime document
        const gameTimeDoc = await db.collection("gameTimes").doc(gameTimeId).get();
        
        if (!gameTimeDoc.exists) {
            return res.status(404).json({ error: "GameTime not found" });
        }

        const gameTime = gameTimeDoc.data();
        
        // Verify the GameTime belongs to the user
        if (gameTime.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized access to this GameTime" });
        }

        // Create a GameSession using the habits from GameTime
        const newSession = new GameSession({
            gameTimeId,
            habitsSnapshot: gameTime.habits,
            status: "pending",
            userId: req.user.uid,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week expiration
        });

        const sessionRef = await db.collection(gameSessionsCollection).add({ ...newSession });

        return res.json({ 
            message: "Test GameSession created!", 
            gameSessionId: sessionRef.id, 
            expiresAt: newSession.expiresAt 
        });
    } catch (error) {
        console.error("Error creating test GameSession:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;