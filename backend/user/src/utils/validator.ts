import { z } from "zod";

// Schema for login request body
export const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }).trim(),
});
