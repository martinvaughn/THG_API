const express = require("express");
const { db } = require("../utils/db");
const { authenticate } = require("../utils/auth");
const DeviceToken = require("../models/DeviceToken");

const router = express.Router();

router.post("/register", authenticate, async (req, res) => {
    try {
        const { token, platform } = req.body;
        
        const deviceToken = new DeviceToken({
            userId: req.user.uid,
            token,
            platform
        });

        await db.collection("deviceTokens")
            .doc(token) // Use token as document ID to prevent duplicates
            .set({ ...deviceToken });

        res.json({ message: "Device token registered successfully" });
    } catch (error) {
        console.error("Error registering device token:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;