import { z } from "zod";
import { redisClient } from "../config/redis.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { generateOtp } from "../utils/generateOTP.js";
import { loginSchema } from "../utils/validator.js";
import TryCatch from "../utils/TryCatch.js";
import type { RequestHandler } from "express";
import generateJwtToken from "../utils/generateJWT.js";
import { createUser, findUserByEmail } from "../services/user.service.js";
import type { IUser } from "../model/User.js";

export const loginUser: RequestHandler = TryCatch(async (req, res) => {
    // Check if Redis client is connected
    if (!redisClient.isOpen) {
        throw new Error("Redis client is not connected");
    }

    // Validate request body using Zod
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: z.treeifyError(parsed.error),
        });
    }

    const { email } = parsed.data;

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

export const forgetPassword: RequestHandler = TryCatch(async (req, res) => {
    // Check if Redis client is connected
    if (!redisClient.isOpen) {
        throw new Error("Redis client is not connected");
    }

    // Validate request body using Zod
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: z.treeifyError(parsed.error),
        });
    }

    const { email } = parsed.data;

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

export const verifyUser: RequestHandler = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;

    // Validate input
    if (!email || !enteredOtp) {
        return res.status(400).json({
            message: "Email and OTP are required",
        });
    }

    // Check OTP in Redis
    const otpKey = `otp:login:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp || storedOtp !== enteredOtp) {
        return res.status(400).json({
            message: "Invalid or expired OTP",
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
        message: "User verified successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        token,
    });
});
