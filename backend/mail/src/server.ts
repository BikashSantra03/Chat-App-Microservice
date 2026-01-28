import colors from "colors";
import { connectRabbitMQ, startConsumers } from "./config/consumer.js";
import { createApp } from "./app.js";

export const startServer = async () => {
    const app = createApp();

    try {
        // Connect to RabbitMQ and start consumers
        await connectRabbitMQ();
        await startConsumers();

        const PORT = process.env.PORT || 3001;

        app.listen(PORT, () => {
            console.log(`Mail Server is running on PORT ${PORT} ??`.blue);
        });
    } catch (error) {
        console.error("Failed to start Mail server:".red, error);
        process.exit(1);
    }
};

