const express = require("express");
const { db } = require("../utils/db");
const { authenticate } = require("../utils/auth");
const Habit = require("../models/Habit");

const router = express.Router();

// Create a new habit
router.post("/", authenticate, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Missing fields" });

    const habit = new Habit({ name, userId: req.user.uid });
    const docRef = await db.collection("habits").add({ ...habit });

    habit.id = docRef.id;
    return res.json(habit);
});

// Get all user's habits
router.get("/", authenticate, async (req, res) => {
    const snapshot = await db.collection("habits").where("userId", "==", req.user.uid).get();
    const habits = snapshot.docs.map(doc => Habit.fromFirestore(doc));
    return res.json(habits);
});

module.exports = router;