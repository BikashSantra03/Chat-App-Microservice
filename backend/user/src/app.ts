import express from "express";
import type { Express } from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js";

export const createApp = (): Express => {
    const app = express();

    // Middleware to parse JSON bodies
    app.use(express.json());

    // CORS Configuration: Modular and secure setup
    const allowedOrigins =
        process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim())?.filter(Boolean) || [
            "http://localhost:8080",
        ];

    const corsOptions: cors.CorsOptions = {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true); // Allow if origin is whitelisted or absent (e.g., same-origin)
                return;
            }

            callback(new Error("Not allowed by CORS")); // Reject others
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        optionsSuccessStatus: 204, // Efficient response for preflight
    };

    // Apply CORS middleware globally (before routes for efficiency)
    app.use(cors(corsOptions));

    app.use("/api/v1/users", userRouter);

    app.get("/", (req, res) => {
        res.send("<h1>User Server is up and running ??</h1>");
    });

    return app;
};
