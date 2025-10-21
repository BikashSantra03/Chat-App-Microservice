import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import connectDb from "./config/db.js";
import userRouter from "./routes/user.route.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { connectRedis } from "./config/redis.js";

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the user router
app.use("/api/v1", userRouter);

// Default API route
app.get("/", (req, res) => {
    res.send("<h1>User Server is up and running 🚀</h1>");
});

// Start server
async function startServer() {
    try {
        await connectDb();
        await connectRedis();
        await connectRabbitMQ();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`User Server is running on PORT ${PORT} 🚀`.blue);
        });
    } catch (error) {
        console.error("Failed to start User server:".red, error);
        process.exit(1);
    }
}

startServer();
