const express = require("express");
const { db } = require("../utils/db");
const { authenticate } = require("../utils/auth");
const Group = require("../models/Group");

const router = express.Router();

// Create a new group
router.post("/", authenticate, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Missing fields" });

    const group = new Group({ 
        name, 
        userId: req.user.uid 
    });
    const docRef = await db.collection("groups").add({
        name: group.name,
        userId: group.userId,
        createdAt: group.createdAt
    });

    group.id = docRef.id;
    return res.json(group);
});

// Get user groups
router.get("/", authenticate, async (req, res) => {
    const snapshot = await db.collection("groups").where("userId", "==", req.user.uid).get();
    const groups = snapshot.docs.map(doc => Group.fromFirestore(doc));
    return res.json(groups);
});

router.get("/hello-world", async (req, res) => {
    return res.json({ message: "Hello World" });
});

module.exports = router; 