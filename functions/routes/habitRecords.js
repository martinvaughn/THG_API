const express = require("express");
const { db } = require("../utils/db");
const { authenticate } = require("../utils/auth");
const HabitRecord = require("../models/HabitRecord");
const GameSession = require("../models/Gamesession");

const router = express.Router();
const habitRecordsCollection = "habitRecords";
const gameSessionsCollection = "gameSessions";

/**
 * 📌 Record a Habit Swipe (Left = Completed, Right = Failed)
 */
router.post("/", authenticate, async (req, res) => {
    const { gameSessionId, habitId, completed } = req.body;
    if (!gameSessionId || !habitId || typeof completed !== "boolean") {
        return res.status(400).json({ error: "Invalid data" });
    }

    try {
        // 🔹 Check if the GameSession exists and is still valid
        const sessionRef = db.collection(gameSessionsCollection).doc(gameSessionId);
        const sessionDoc = await sessionRef.get();

        if (!sessionDoc.exists) {
            return res.status(404).json({ error: "GameSession not found." });
        }

        const gameSession = GameSession.fromFirestore(sessionDoc);

        if (new Date(gameSession.expiresAt) < new Date()) {
            return res.status(400).json({ error: "This GameSession has expired." });
        }

        // 🔹 Create a HabitRecord for this habit swipe
        const habitRecord = new HabitRecord({
            gameSessionId,
            habitId,
            completed,
            userId: req.user.uid,
        });

        const habitRecordRef = await db.collection(habitRecordsCollection).add({ ...habitRecord });

        // 🔹 Check if all habits for this session have been recorded
        const recordedHabits = await db
            .collection(habitRecordsCollection)
            .where("gameSessionId", "==", gameSessionId)
            .where("userId", "==", req.user.uid)
            .get();

        if (recordedHabits.size === gameSession.habitsSnapshot.length) {
            // ✅ Mark the GameSession as "completed"
            await sessionRef.update({ status: "completed" });
        }

        return res.json({ message: "Habit recorded successfully." });
    } catch (error) {
        console.error("Error saving habit record:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;