import { createClient } from "redis";

// Declare redisClient globally
let redisClient: ReturnType<typeof createClient>;

const connectRedis = async () => {
    try {
        const redisUri = process.env.REDIS_URI;
        if (!redisUri) {
            throw new Error(
                "REDIS_URI is not defined in environment variables!"
            );
        }

        redisClient = createClient({
            url: redisUri,
        });

        redisClient.on("error", (err) => {
            console.error("Redis Client Error:".red, err);
        });

        await redisClient.connect();
        console.log("Connected to Redis 📦".magenta);
    } catch (error) {
        console.error("Failed to connect to Redis:".red, error);
        process.exit(1);
    }
};

export { connectRedis, redisClient };
