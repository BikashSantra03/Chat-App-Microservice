import express from "express";
import type { Express } from "express";

export const createApp = (): Express => {
    const app = express();

    // Middleware to parse JSON bodies
    app.use(express.json());

    // Default API route
    app.get("/", (req, res) => {
        res.send("<h1>Mail Server is up and running ??</h1>");
    });

    return app;
};

