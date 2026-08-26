import mongoose from "mongoose";
import config from "./config.js";

const connectdb = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log("Database connected!");
    } catch (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
}

export default connectdb;
