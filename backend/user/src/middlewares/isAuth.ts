import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define the expected JWT payload structure
interface JwtPayload {
    id: string;
    email: string;
}

// Extend the Request interface to include a user property
export interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

export const isAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get the Authorization header
        const authHeader = req.headers.authorization;

        // Check if header exists and starts with 'Bearer'
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authorization header missing or invalid!",
            });
        }

        // Extract the token
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Token missing in Authorization header!",
            });
        }

        // Ensure JWT_SECRET is available
        const secret = process.env.JWT_SECRET as string;
        if (!secret) {
            throw new Error(
                "JWT_SECRET is not defined in environment variables"
            );
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Attach user data to the request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };

        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: "Token has expired, Please login!",
            });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: "Invalid token!",
            });
        }

        // Handle other unexpected errors
        return res.status(500).json({
            message: "Server error during authentication",
        });
    }
};
