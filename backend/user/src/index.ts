import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import connectDb from "./config/db.js";
import userRouter from "./routes/user.route.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { connectRedis } from "./config/redis.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
// import * as swaggerDocument from "./swagger.json";

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS Configuration: Modular and secure setup
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:8080",
];
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow if origin is whitelisted or absent (e.g., same-origin)
        } else {
            callback(new Error("Not allowed by CORS")); // Reject others
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204, // Efficient response for preflight
};

// Apply CORS middleware globally (before routes for efficiency)
app.use(cors(corsOptions));

// Mount the user router
app.use("/api/v1", userRouter);

// Default API route
app.get("/", (req, res) => {
    res.send("<h1>User Server is up and running 🚀</h1>");
});

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
