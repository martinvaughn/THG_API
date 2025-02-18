const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const GameSession = require("../models/Gamesession");

// The main scheduled function
exports.createScheduledGameSessions = onSchedule({
    schedule: "0 * * * *", // Runs at the start of every hour
    timeZone: "UTC",
    retryCount: 3,
    memory: "256MiB", // Minimal memory since this is a light operation
}, async (event) => {
    await processGameSessions();
});

// HTTP endpoint for testing
exports.testCreateGameSessions = onRequest(async (req, res) => {
    try {
        await processGameSessions();
        res.json({ success: true, message: "Game sessions processed successfully" });
    } catch (error) {
        logger.error("Error in test endpoint:", error);
        res.status(500).json({ error: error.message });
    }
});

// Shared logic moved to a separate function
async function processGameSessions() {
    const db = admin.firestore();
    const now = new Date();
    // Only get the hour part for comparison
    const currentHour = now.getUTCHours().toString().padStart(2, '0');
    const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);

    logger.info(`Starting scheduled check for ${currentDay} at ${currentHour}:00 UTC`);

    try {
        // Extract just the hour from schedule.time for comparison
        const snapshot = await db.collection("gameTimes")
            .where("schedule.time", ">=", `${currentHour}:00`)
            .where("schedule.time", "<", `${currentHour}:59`)
            .get();

        const snapshot2 = await db.collection("gameTimes").get();
        logger.info("ALL DOCS",snapshot2.docs);
        for (const doc of snapshot2.docs) {
            const gameTime = doc.data();
            logger.info("SCHED", gameTime.schedule, currentHour, currentDay);
        }

        logger.info(`Found ${snapshot.size} potential GameTimes to process`);

        const batch = db.batch();
        const notifications = [];

        for (const doc of snapshot.docs) {
            const gameTime = doc.data();

            if (gameTime.schedule.type === "weekly" && 
                !gameTime.schedule.days.includes(currentDay)) {
                logger.debug(`Skipping GameTime ${doc.id} - wrong day of week`);
                continue;
            }

            const newSession = new GameSession({
                gameTimeId: doc.id,
                habitsSnapshot: gameTime.habits,
                userId: gameTime.userId,
                expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            });

            const sessionRef = db.collection("gameSessions").doc();
            batch.set(sessionRef, { ...newSession });

            notifications.push({
                userId: gameTime.userId,
                gameTimeName: gameTime.name
            });
            
            logger.info(`Queued new session for GameTime ${doc.id} (${gameTime.name})`);
        }

        if (notifications.length > 0) {
            await batch.commit();
            logger.info(`Successfully created ${notifications.length} new GameSessions`);

            for (const notification of notifications) {
                await sendNotification(notification.userId, notification.gameTimeName);
            }
        } else {
            logger.info('No GameSessions needed to be created this hour');
        }

    } catch (error) {
        logger.error("Error creating scheduled GameSessions:", error);
        throw error; // Retrying might help if it was a temporary failure
    }
}

async function sendNotification(userId, gameTimeName) {
    const db = admin.firestore();
    
    try {
        const tokenSnapshot = await db.collection("deviceTokens")
            .where("userId", "==", userId)
            .get();

        const tokens = tokenSnapshot.docs.map(doc => doc.data().token);

        if (tokens.length === 0) {
            logger.info(`No device tokens found for user ${userId}`);
            return;
        }

        const message = {
            notification: {
                title: "New Game Session Started!",
                body: `Your GameTime "${gameTimeName}" has started. Time to play!`
            },
            tokens: tokens
        };

        const result = await admin.messaging().sendMulticast(message);
        logger.info(`Notifications sent to ${result.successCount}/${tokens.length} devices for user ${userId}`);
        
        if (result.failureCount > 0) {
            logger.warn(`Failed to send ${result.failureCount} notifications`, result.responses.filter(r => !r.success));
        }
    } catch (error) {
        logger.error(`Error sending notification to user ${userId}:`, error);
        // Don't throw here - we don't want to fail the whole function if notifications fail
    }
}