import userModel from "../models/user.model.js";

export const adminOnly = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.accountType !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }
        if (user.isBanned) {
            return res.status(403).json({ message: "Account has been banned" });
        }
        next();
    } catch (err) {
        console.error("Admin middleware error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
