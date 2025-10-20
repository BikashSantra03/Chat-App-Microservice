import mongoose from "mongoose";

const connectDb = async () => {
    const url = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME || "chatApp";

    if (!url) {
        throw new Error(
            "MONGO_URI is not defined in environment variables!".red
        );
    }

    try {
        await mongoose.connect(url, { dbName });
        console.log("Connected to MongoDB 🍃".green);
    } catch (error) {
        console.error("Failed to connect to MongoDB:".red, error);
        process.exit(1);
    }
};

export default connectDb;
