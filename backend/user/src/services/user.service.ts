import { User, type IUser } from "../model/User.js";

// Find user by email
export async function findUserByEmail(email: string): Promise<IUser | null> {
  return await User.findOne({ email });
}

// Find user by ID
export async function findUserById(id: string): Promise<IUser | null> {
  return await User.findById(id);
}
// Create a new user
export async function createUser(name: string, email: string): Promise<IUser> {
  return await User.create({ name, email });
}