import { Router } from "express"
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
} from "../controllers/cart.controller.js"
import { authenticate } from "../middleware/auth.js"

const cartRouter = Router()

cartRouter.get("/", authenticate, getCart)
cartRouter.post("/add", authenticate, addToCart)
cartRouter.delete("/remove/:itemId", authenticate, removeFromCart)
cartRouter.put("/update/:itemId", authenticate, updateCartItem)
cartRouter.delete("/clear", authenticate, clearCart)

export default cartRouter
