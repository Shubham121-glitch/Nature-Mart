import userModel from "../models/user.model.js";
import crypto from "crypto"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import config from "../config/config.js";
import sessionModel from "../models/sessions.model.js";

const SALT_ROUNDS = 10;

export const register = async (req, res) => {
    try {
        const { username, email, password, accountType, address } = req.body;

        if (!username || !email || !password || !accountType) {
            return res.status(400).json({ message: "Username, email, password, and account type are required" })
        }

        if (accountType === "admin") {
            return res.status(403).json({ message: "Admin registration is not allowed" })
        }

        const isAlreadyRegistered = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (isAlreadyRegistered) {
            return res.status(409).json({
                message: "Username or Email already exists!"
            })
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
            accountType,
            address
        })

        const refreshToken = jwt.sign({
            id: user._id
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        })

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        })

        const accessToken = jwt.sign({
            id: user._id,
            sessionId: session._id
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                accountType: user.accountType,
                address: user.address
            },
            accessToken
        });
    } catch (err) {
        console.error("Register error:", err.message)
        res.status(500).json({ message: "Failed to register user" })
    }
}


export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { username, email, address } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (username && username !== user.username) {
            const existing = await userModel.findOne({ username, _id: { $ne: userId } });
            if (existing) {
                return res.status(409).json({ message: "Username already taken" })
            }
            user.username = username;
        }

        if (email && email !== user.email) {
            const existing = await userModel.findOne({ email, _id: { $ne: userId } });
            if (existing) {
                return res.status(409).json({ message: "Email already in use" })
            }
            user.email = email;
        }

        if (address) {
            user.address = { ...user.address, ...address };
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                accountType: user.accountType,
                address: user.address
            }
        })
    } catch (err) {
        console.error("UpdateProfile error:", err.message)
        res.status(500).json({ message: "Failed to update profile" })
    }
}

export const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" })
        }

        const user = await userModel.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" })
        }

        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" })
    } catch (err) {
        console.error("ChangePassword error:", err.message)
        res.status(500).json({ message: "Failed to change password" })
    }
}

export const becomeVendor = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (user.accountType === "vendor") {
            return res.status(400).json({ message: "You are already a vendor" })
        }

        if (user.accountType === "admin") {
            return res.status(400).json({ message: "Admin accounts cannot become vendors" })
        }

        user.accountType = "vendor";
        await user.save();

        res.status(200).json({
            message: "Congratulations! You are now a vendor. You can start listing products.",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                accountType: user.accountType,
                address: user.address
            }
        })
    } catch (err) {
        console.error("BecomeVendor error:", err.message)
        res.status(500).json({ message: "Failed to become vendor" })
    }
}

export const getUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            message: "User found",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                accountType: user.accountType,
                address: user.address
            }
        })
    } catch (err) {
        console.error("GetUser error:", err.message)
        res.status(500).json({ message: "Failed to fetch user" })
    }
}

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                message: "Refresh token not found"
            })
        }

        let decoded;
        try {
            decoded = jwt.verify(token, config.JWT_SECRET);
        } catch {
            return res.status(401).json({ message: "Invalid refresh token" })
        }

        const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const session = await sessionModel.findOne({
            refreshTokenHash,
            revoke: false
        });
        if (!session) {
            return res.status(401).json({
                message: "Session not found or revoked"
            })
        }

        const accessToken = jwt.sign({
            id: decoded.id,
            sessionId: session._id
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        });

        const newRefreshToken = jwt.sign({
            id: decoded.id,
            sessionId: session._id
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        });

        const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
        session.refreshTokenHash = newRefreshTokenHash;
        await session.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken
        });
    } catch (err) {
        console.error("RefreshToken error:", err.message)
        res.status(500).json({ message: "Failed to refresh token" })
    }
}

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not found"
            })
        }
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const session = await sessionModel.findOne({
            refreshTokenHash,
            revoke: false
        });
        if (!session) {
            return res.status(401).json({
                message: "Session not found"
            })
        }
        session.revoke = true;
        await session.save();
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });
        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (err) {
        console.error("Logout error:", err.message)
        res.status(500).json({ message: "Failed to logout" })
    }
}

export const logoutAll = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not found"
            })
        }
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        await sessionModel.updateMany({
            refreshTokenHash,
            revoke: false
        }, {
            revoke: true
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });
        res.status(200).json({
            message: "User logged out from all devices successfully"
        });
    } catch (err) {
        console.error("LogoutAll error:", err.message)
        res.status(500).json({ message: "Failed to logout from all devices" })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                message: "User not found"
            })
        }

        if (user.isBanned) {
            return res.status(403).json({
                message: "Your account has been banned. Please contact support."
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Password is incorrect"
            })
        }

        const refreshToken = jwt.sign({
            id: user._id
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        });

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        const accessToken = jwt.sign({
            id: user._id,
            sessionId: session._id
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                accountType: user.accountType
            },
            accessToken
        })
    } catch (err) {
        console.error("Login error:", err.message)
        res.status(500).json({ message: "Failed to login" })
    }
}
