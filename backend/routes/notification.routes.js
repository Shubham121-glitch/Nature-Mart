import { Router } from "express"
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notification.controller.js"
import { authenticate } from "../middleware/auth.js"

const notificationRouter = Router()

notificationRouter.get("/", authenticate, getNotifications)
notificationRouter.put("/:notificationId/read", authenticate, markAsRead)
notificationRouter.put("/read-all", authenticate, markAllAsRead)
notificationRouter.delete("/:notificationId", authenticate, deleteNotification)

export default notificationRouter
