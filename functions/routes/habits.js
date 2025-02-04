const express = require("express");
const { db } = require("../utils/db");
const { authenticate } = require("../utils/auth");
const Habit = require("../models/Habit");

const router = express.Router();

// Create a new habit
router.post("/", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Missing fields" });

    const habit = new Habit({ name, userId: 1 });
    const docRef = await db.collection("habits").add({ ...habit });

    habit.id = docRef.id;
    return res.json(habit);
});

// Get all user's habits
router.get("/", async (req, res) => {
    const snapshot = await db.collection("habits").where("userId", "==", 1).get();
    const habits = snapshot.docs.map(doc => Habit.fromFirestore(doc));
    return res.json(habits);
});

module.exports = router;