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

        if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
            throw new Error("Time must be in 'HH:MM' 24-hour format.");
        }

        if (type === "weekly") {
            if (!Array.isArray(days) || days.length === 0 || !days.every(GameTime.isValidDay)) {
                throw new Error("Weekly schedule must include valid 'days' (e.g., ['Monday', 'Wednesday']).");
            }
        }

        return { type, days: days || [], time };
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