import { Router } from "express"
import {
  createOrder,
  getUserOrders,
  getVendorOrders,
  updateOrderItemStatus,
  getVendorAnalytics
} from "../controllers/order.controller.js"
import { authenticate } from "../middleware/auth.js"

const orderRouter = Router()

orderRouter.post("/create", authenticate, createOrder)
orderRouter.get("/user", authenticate, getUserOrders)
orderRouter.get("/vendor", authenticate, getVendorOrders)
orderRouter.put("/:orderId/item/:itemId/status", authenticate, updateOrderItemStatus)
orderRouter.get("/analytics", authenticate, getVendorAnalytics)

export default orderRouter
