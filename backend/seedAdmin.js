import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "./config/config.js";
import userModel from "./models/user.model.js";

const seedAdmin = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log("Connected to MongoDB");

        const existingAdmin = await userModel.findOne({ email: "admin@hortx.com" });
        if (existingAdmin) {
            console.log("Admin user already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        const admin = await userModel.create({
            username: "admin",
            email: "admin@hortx.com",
            password: hashedPassword,
            accountType: "admin",
            address: {
                state: "Delhi",
                district: "New Delhi",
                tehsil: "New Delhi",
                pin: "110001",
                contactNumber: "9999999999"
            }
        });

        console.log("Admin user created successfully:");
        console.log("  Email: admin@hortx.com");
        console.log("  Password: admin123");
        console.log("  ID:", admin._id);

        process.exit(0);
    } catch (err) {
        console.error("Error seeding admin:", err.message);
        process.exit(1);
    }
};

seedAdmin();
