import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUserRole,
    banUser,
    unbanUser,
    getAllProducts,
    deleteProduct,
    getAllOrders,
    getOrderById,
    getAllVendors,
    getAnalytics
} from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter.use(authenticate, adminOnly);

adminRouter.get("/dashboard", getDashboardStats);
adminRouter.get("/analytics", getAnalytics);

adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/:id", getUserById);
adminRouter.put("/users/:id/role", updateUserRole);
adminRouter.put("/users/:id/ban", banUser);
adminRouter.put("/users/:id/unban", unbanUser);

adminRouter.get("/products", getAllProducts);
adminRouter.delete("/products/:id", deleteProduct);

adminRouter.get("/orders", getAllOrders);
adminRouter.get("/orders/:id", getOrderById);

adminRouter.get("/vendors", getAllVendors);

export default adminRouter;
