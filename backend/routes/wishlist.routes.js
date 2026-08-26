import { Router } from "express"
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from "../controllers/wishlist.controller.js"
import { authenticate } from "../middleware/auth.js"

const wishlistRouter = Router()

wishlistRouter.get("/", authenticate, getWishlist)
wishlistRouter.post("/add", authenticate, addToWishlist)
wishlistRouter.delete("/remove/:productId", authenticate, removeFromWishlist)

export default wishlistRouter
