class GameTime {
    constructor({ name, schedule, habits = [], userId, createdAt }) {
        this.name = name;
        this.schedule = GameTime.validateSchedule(schedule); // Enforce structure
        this.habits = habits; // Array of habit IDs
        this.userId = userId;
        this.createdAt = createdAt || new Date().toISOString();
    }

    /**
     * ✅ Enforce strict validation on the schedule format
     */
    static validateSchedule(schedule) {
        if (!schedule || typeof schedule !== "object") {
            throw new Error("Invalid schedule format.");
        }

        const { type, days, time } = schedule;

        if (!["daily", "weekly"].includes(type)) {
            throw new Error("Schedule type must be 'daily' or 'weekly'.");
        }

        // Validate UTC time format (HH:MM with optional Z suffix)
        if (typeof time !== "string" || !/^([01]\d|2[0-3]):([0-5]\d)Z?$/.test(time)) {
            throw new Error("Time must be in UTC 24-hour format 'HH:MM' (e.g., '14:30')");
        }

        if (type === "weekly") {
            if (!Array.isArray(days) || days.length === 0 || !days.every(GameTime.isValidDay)) {
                throw new Error("Weekly schedule must include valid 'days' (e.g., ['Monday', 'Wednesday']).");
            }
        }

        // Store time without the Z suffix for consistency
        const cleanTime = time.replace('Z', '');
        return { type, days: days || [], time: cleanTime };
    }

    /**
     * ✅ Checks if a day is valid
     */
    static isValidDay(day) {
        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return validDays.includes(day);
    }

    static fromFirestore(doc) {
        const gameTime = new GameTime(doc.data());
        gameTime.id = doc.id;
        return gameTime;
    }
}

module.exports = GameTime;