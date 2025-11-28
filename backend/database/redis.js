const redis = require('redis');
require('dotenv').config();

// Singleton pattern for Redis connection
class RedisClient {
    constructor() {
        if (RedisClient.instance) {
            return RedisClient.instance;
        }

        this.client = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
            },
            password: process.env.REDIS_PASSWORD || undefined,
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
            console.log('Redis client connected');
        });

        this.connect();

        RedisClient.instance = this;
    }

    async connect() {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    async get(key) {
        return await this.client.get(key);
    }

    async set(key, value, expiration = 3600) {
        return await this.client.setEx(key, expiration, value);
    }

    async del(key) {
        return await this.client.del(key);
    }

    async exists(key) {
        return await this.client.exists(key);
    }

    async close() {
        await this.client.quit();
    }
}

module.exports = new RedisClient();
