class DeviceToken {
    constructor({ userId, token, platform, createdAt }) {
        this.userId = userId;
        this.token = token;
        this.platform = platform; // 'ios' or 'android'
        this.createdAt = createdAt || new Date().toISOString();
    }

    static fromFirestore(doc) {
        const token = new DeviceToken(doc.data());
        token.id = doc.id;
        return token;
    }
}

module.exports = DeviceToken;