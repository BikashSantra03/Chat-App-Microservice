import colors from "colors";
import connectDb from "./config/db.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { connectRedis } from "./config/redis.js";
import { createApp } from "./app.js";

export const startServer = async () => {
    try {
        await connectDb();
        await connectRedis();
        await connectRabbitMQ();

        const app = createApp();
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`User Server is running on PORT ${PORT} ??`.blue);
        });
    } catch (error) {
        console.error("Failed to start User server:".red, error);
        process.exit(1);
    }
};

