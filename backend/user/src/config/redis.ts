import { createClient } from "redis";

const connectRedis = async () => {
    try {
        const redisUri = process.env.REDIS_URI;
        if (!redisUri) {
            throw new Error(
                "REDIS_URI is not defined in environment variables!".red
            );
        }

        const redisClient = createClient({
            url: redisUri,
        });

        redisClient.on("error", (err) => {
            console.error("Redis Client Error:".red, err);
        });

        await redisClient.connect();
        console.log("Connected to Redis 📦".magenta);

        // Test Redis
        // await redisClient.set("testKey", "Hello from Redis!");
        // const value = await redisClient.get("testKey");
        // console.log(`Redis test value: ${value}`.yellow);
    } catch (error) {
        console.error("Failed to connect to Redis:".red, error);
        process.exit(1);
    }
};

export default connectRedis;
