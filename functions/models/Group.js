class Group {
    constructor({ name, userId, createdAt }) {
        this.name = name;
        this.userId = userId;
        this.createdAt = createdAt || new Date().toISOString();
    }

    static fromFirestore(doc) {
        const group = new Group(doc.data());
        group.id = doc.id;
        return group;
    }
}

module.exports = Group;