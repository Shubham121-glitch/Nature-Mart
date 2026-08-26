import { Router } from "express";
import { register, getUser, refreshToken, logout, logoutAll, login, updateProfile, changePassword, becomeVendor } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/get-user", authenticate, getUser);
authRouter.put("/update-profile", authenticate, updateProfile);
authRouter.put("/change-password", authenticate, changePassword);
authRouter.post("/become-vendor", authenticate, becomeVendor);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", authenticate, logoutAll);

export default authRouter;
