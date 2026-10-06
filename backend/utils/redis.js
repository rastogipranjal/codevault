import { createClient } from "redis";

// In-memory fallback for local development when Redis is not running
const memoryStore = new Map();
let isConnected = false;

const rawClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 1) {
                // Stop retrying to prevent spamming the console
                return false;
            }
            return 500;
        }
    }
});

rawClient.on("error", (err) => {
    if (isConnected) {
        console.error("Redis Client Error:", err.message);
    }
});

export const connectRedis = async () => {
    try {
        await rawClient.connect();
        isConnected = true;
        console.log("Connected to Redis successfully.");
    } catch (error) {
        isConnected = false;
        console.warn("[WARN] Redis is not running locally. Using in-memory fallback for token blacklisting.");
    }
};

const redisClient = {
    get isOpen() {
        return isConnected && rawClient.isOpen;
    },
    async get(key) {
        if (isConnected && rawClient.isOpen) {
            try {
                return await rawClient.get(key);
            } catch (err) {
                return memoryStore.get(key) || null;
            }
        }
        return memoryStore.get(key) || null;
    },
    async setEx(key, seconds, value) {
        if (isConnected && rawClient.isOpen) {
            try {
                return await rawClient.setEx(key, seconds, value);
            } catch (err) {
                memoryStore.set(key, value);
                setTimeout(() => memoryStore.delete(key), seconds * 1000);
                return "OK";
            }
        }
        memoryStore.set(key, value);
        setTimeout(() => memoryStore.delete(key), seconds * 1000);
        return "OK";
    },
    async set(key, value) {
        if (isConnected && rawClient.isOpen) {
            try {
                return await rawClient.set(key, value);
            } catch (err) {
                memoryStore.set(key, value);
                return "OK";
            }
        }
        memoryStore.set(key, value);
        return "OK";
    },
    async del(key) {
        if (isConnected && rawClient.isOpen) {
            try {
                return await rawClient.del(key);
            } catch (err) {
                memoryStore.delete(key);
                return 1;
            }
        }
        memoryStore.delete(key);
        return 1;
    }
};

export default redisClient;