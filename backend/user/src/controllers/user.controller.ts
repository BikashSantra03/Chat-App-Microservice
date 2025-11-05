import type { RequestHandler } from "express";
import { format } from "date-fns";
import { redisClient } from "../config/redis.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { generateOtp } from "../utils/generateOTP.js";
import TryCatch from "../utils/TryCatch.js";
import generateJwtToken from "../utils/generateJWT.js";
import {
    createUser,
    findAllUsers,
    findUserByEmail,
    findUserById,
} from "../services/user.service.js";
import type { IUser } from "../model/User.js";
import type { AuthRequest } from "../middlewares/isAuth.js";

/**
 * Login User Controller -------------------------------------------------------------
 */
export const loginUser: RequestHandler = TryCatch(async (req, res) => {
    // Check if Redis client is connected
    if (!redisClient.isOpen) {
        throw new Error("Redis client is not connected");
    }

    const { email } = req.body;

    // Use login-specific keys
    const rateLimitKey = `otp:ratelimit:login:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);

    if (rateLimit) {
        return res.status(429).json({
            message:
                "Too many login OTP requests. Please wait 60 seconds before requesting a new OTP!",
        });
    }

    const otp = generateOtp(); // Generate a 6-digit OTP
    const otpKey = `otp:login:${email}`;

    // Store OTP in Redis with a 5-minute (300 seconds) expiration
    await redisClient.setEx(otpKey, 300, otp);

    // Set rate limit for 60 seconds
    await redisClient.setEx(rateLimitKey, 60, "1");

    const message = {
        to: email,
        subject: "Your Login OTP",
        body: `Your OTP for login is ${otp}. It is valid for the next 5 minutes.`,
    };

    await publishToQueue("send-otp-login", message); // login-specific queue

    return res.status(200).json({
        message: "Login OTP sent to your email.",
    });
});

/**
 * Forget Password Controller -------------------------------------------------------------
 */
export const forgetPassword: RequestHandler = TryCatch(async (req, res) => {
    // Check if Redis client is connected
    if (!redisClient.isOpen) {
        throw new Error("Redis client is not connected");
    }

    const { email } = req.body;

    // Use forget-password-specific keys
    const rateLimitKey = `otp:ratelimit:forget:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);

    if (rateLimit) {
        return res.status(429).json({
            message:
                "Too many password reset OTP requests. Please wait 60 seconds before requesting a new OTP!",
        });
    }

    const otp = generateOtp(); // Generate a 6-digit OTP
    const otpKey = `otp:forget:${email}`;

    // Store OTP in Redis with a 5-minute (300 seconds) expiration
    await redisClient.setEx(otpKey, 300, otp);

    // Set rate limit for 60 seconds
    await redisClient.setEx(rateLimitKey, 60, "1");

    const message = {
        to: email,
        subject: "Your Password Reset OTP",
        body: `Your OTP for password reset is ${otp}. It is valid for the next 5 minutes.`,
    };

    await publishToQueue("send-otp-forget", message); // forget-password-specific queue

    return res.status(200).json({
        message: "Password reset OTP sent to your email.",
    });
});

/**
 * Verify User Controller -------------------------------------------------------------
 */
export const verifyUser: RequestHandler = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;

    // Check OTP in Redis
    const otpKey = `otp:login:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp || storedOtp !== enteredOtp) {
        return res.status(400).json({
            message: "Invalid or expired OTP!",
        });
    }

    // Delete OTP from Redis
    await redisClient.del(otpKey);

    // Find or create user
    let user: IUser | null = await findUserByEmail(email);

    if (!user) {
        const name = email.slice(0, 8);
        user = await createUser(name, email);
    }

    // Generate JWT token
    const token = generateJwtToken({
        id: user._id.toString(),
        email: user.email,
    });

    // Return response
    return res.json({
        message: "User verified successfully!",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        token,
    });
});

/**
 * Get My Profile Controller -------------------------------------------------------------
 */
export const getMyProfile: RequestHandler = TryCatch(
    async (req: AuthRequest, res) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Not authenticated!",
            });
        }
        // Fetch user by ID
        const user = await findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found!",
            });
        }

        // Return user profile
        return res.json({
            message: "Profile retrieved successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: format(user.createdAt, "dd-MM-yyyy"),
            },
        });
    }
);

/**
 * Update Profile Controller -------------------------------------------------------------
 */
export const updateProfile: RequestHandler = TryCatch(
    async (req: AuthRequest, res) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Not authenticated!",
            });
        }

        const { name } = req.body;

        // Fetch user by ID
        const user = await findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found!",
            });
        }

        // Update name
        user.name = name;
        await user.save();

        // Return updated user profile
        return res.json({
            message: "Profile updated successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: format(user.createdAt, "dd-MM-yyyy"),
            },
        });
    }
);

/**
 * Get All Users Controller -------------------------------------------------------------
 */
export const getAllUsers: RequestHandler = TryCatch(async (req, res) => {
    // Fetch all users (assuming findAllUsers service function exists)
    const users = await findAllUsers();

    // Map users to response format
    const formattedUsers = users.map((user: IUser) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: format(user.createdAt, "dd-MM-yyyy"),
    }));

    return res.json({
        message: "All users retrieved successfully!",
        users: formattedUsers,
    });
});

/**
 * Get User By ID Controller -------------------------------------------------------------
 */
export const getUserById: RequestHandler = TryCatch(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "User ID is required!",
        });
    }

    // Fetch user by ID
    const user = await findUserById(id);

    if (!user) {
        return res.status(404).json({
            message: "User not found!",
        });
    }

    // Return user profile
    return res.json({
        message: "User retrieved successfully!",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: format(user.createdAt, "dd-MM-yyyy"),
        },
    });
});
