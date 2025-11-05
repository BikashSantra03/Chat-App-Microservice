import { z } from "zod";

// Schema for login request body
export const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }).trim(),
});

// Schema for verify User
export const verifySchema = z.object({
    email: z.email("Please enter a valid email address"),
    otp: z
        .string()
        .nonempty("OTP is required")
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
});

// Schema for update User Profile
export const updateSchema = z.object({
    name: z.string().min(1, "Name is required"),
});
