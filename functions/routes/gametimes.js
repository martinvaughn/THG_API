const express = require("express");
const { db } = require("../utils/db");
const { authenticate } = require("../utils/auth");
const GameTime = require("../models/GameTime");

const router = express.Router();
const gametimesCollection = "gameTimes";

/**
 * 📌 Create a new GameTime with strict schedule enforcement
 */
router.post("/", authenticate, async (req, res) => {
    try {
        const { name, schedule, habits } = req.body;
        const newGameTime = new GameTime({
            name,
            schedule,
            habits: habits || [],
            userId: req.user.uid,
        });

        const docRef = await db.collection(gametimesCollection).add({ ...newGameTime });
        return res.json({ message: "GameTime created successfully!", id: docRef.id });
    } catch (error) {
        console.error("Error creating GameTime:", error);
        return res.status(400).json({ error: error.message });
    }
});

/**
 * 📌 Get user's GameTimes
 */
router.get("/", authenticate, async (req, res) => {
    const snapshot = await db.collection(gametimesCollection).where("userId", "==", req.user.uid).get();
    const gameTimes = snapshot.docs.map(doc => GameTime.fromFirestore(doc));
    return res.json(gameTimes);
});

// Update a GameTime (add/remove habits)
router.patch("/:id", authenticate, async (req, res) => {
    const { habits } = req.body;
    const docRef = db.collection(gametimesCollection).doc(req.params.id);
    await docRef.update({ habits });

    return res.json({ message: "GameTime updated" });
});

module.exports = router;