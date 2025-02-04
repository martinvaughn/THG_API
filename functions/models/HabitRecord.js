class HabitRecord {
    constructor({ id, gameSessionId, habitId, completed, userId, timestamp }) {
        this.id = id || null;
        this.gameSessionId = gameSessionId; // Links to the session
        this.habitId = habitId; // The habit being tracked
        this.completed = completed; // true (completed) or false (failed)
        this.userId = userId;
        this.timestamp = timestamp || new Date().toISOString();
    }

    static fromFirestore(doc) {
        return new HabitRecord({ id: doc.id, ...doc.data() });
    }
}

module.exports = HabitRecord;
