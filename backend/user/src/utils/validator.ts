import { z } from "zod";

// Schema for login request body
export const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }).trim(),
});

// Schema for verifyUser
export const verifySchema = z.object({
    email: z.email("Please enter a valid email address"),
    otp: z
        .string()
        .nonempty("OTP is required")
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
});
