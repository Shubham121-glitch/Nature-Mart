import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username must be unique"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email must be unique"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false
    },
    accountType: {
        type: String,
        default: "user",
        enum: ["user", "vendor", "admin"]
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    address: {
        state: {
            type: String,
            required: [true, "State/UT is required"]
        },
        district: {
            type: String,
            required: [true, "District is required"]
        },
        tehsil: {
            type: String,
            required: [true, "Tehsil is required"]
        },
        pin: {
            type: String,
            required: [true, "PIN is required"]
        },
        contactNumber: {
            type: String,
            required: [true, "Contact number is required"]
        }
    }
}, { timestamps: true })

const userModel = mongoose.model("users", userSchema)
export default userModel;