import jwt from "jsonwebtoken";

// Define a user interface for type safety
interface User {
    id: string;
    email: string;
    [key: string]: any; // Allows additional properties
}

function generateJwtToken(user: User): string {
    // Validate user object
    if (!user || !user.id || !user.email) {
        throw new Error("User object with id and email is required");
    }

    // Define payload with id and email
    const payload = {
        id: user.id,
        email: user.email,
    };

    // Ensure JWT_SECRET is available
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // Sign token with secret and set expiry to 15 days
    const token = jwt.sign(payload, secret, {
        expiresIn: "15d",
    });

    return token;
}

export default generateJwtToken;
