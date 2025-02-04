class Habit {
    constructor({name, userId, createdAt, image = null, points = 10 }) {
        this.name = name;
        this.image = image || null;
        this.points = points || 10;
        this.userId = userId;
        this.createdAt = createdAt || new Date().toISOString();
    }

    static fromFirestore(doc) {
        const habit = new Habit(doc.data());
        habit.id = doc.id;  
        return habit;
    }
}

module.exports = Habit;