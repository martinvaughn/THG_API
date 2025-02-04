class GameSession {
    constructor({ gameTimeId, habitsSnapshot, status, expiresAt, userId, createdAt }) {
        this.gameTimeId = gameTimeId;
        this.habitsSnapshot = habitsSnapshot; // List of habit IDs at the time
        this.status = status || "pending"; // "pending", "completed", "failed"
        this.expiresAt = expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        this.userId = userId;
        this.createdAt = createdAt || new Date().toISOString();
    }

    static fromFirestore(doc) {
        const session = new GameSession(doc.data());
        session.id = doc.id;
        return session;
    }
}

module.exports = GameSession;
