import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import { connectRabbitMQ, startConsumers } from "./config/consumer.js"; // Import RabbitMQ functions

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Default API route
app.get("/", (req, res) => {
    res.send("<h1>Mail Server is up and running 📤</h1>");
});

// Start server
async function startServer() {
    try {
        // Connect to RabbitMQ and start consumers
        await connectRabbitMQ();
        await startConsumers();

        const PORT = process.env.PORT || 3001;

        app.listen(PORT, () => {
            console.log(`Mail Server is running on PORT ${PORT} 📤`.blue);
        });
    } catch (error) {
        console.error("Failed to start Mail server:".red, error);
        process.exit(1);
    }
}

startServer();
