import { User, type IUser } from "../model/User.js";

// Create a new user
export async function createUser(name: string, email: string): Promise<IUser> {
    return await User.create({ name, email });
}

// Find user by ID
export async function findUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
}

// Find user by email
export async function findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
}

// Find all users
export async function findAllUsers(): Promise<IUser[]> {
    return await User.find({});
}
