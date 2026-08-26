import notificationModel from "../models/notification.model.js"

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await notificationModel.find({ user: userId }).sort({ createdAt: -1 })
    res.status(200).json({ notifications })
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message })
  }
}

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const { notificationId } = req.params
    const notification = await notificationModel.findById(notificationId)
    if (!notification) return res.status(404).json({ message: "Notification not found" })

    if (notification.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" })
    }

    notification.read = true
    await notification.save()
    res.status(200).json({ message: "Notification marked as read" })
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read", error: err.message })
  }
}

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await notificationModel.updateMany({ user: userId, read: false }, { read: true })
    res.status(200).json({ message: "All notifications marked as read" })
  } catch (err) {
    res.status(500).json({ message: "Failed to mark all as read", error: err.message })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;

    const { notificationId } = req.params
    const notification = await notificationModel.findById(notificationId)
    if (!notification) return res.status(404).json({ message: "Notification not found" })

    if (notification.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await notificationModel.findByIdAndDelete(notificationId)
    res.status(200).json({ message: "Notification deleted" })
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification", error: err.message })
  }
}
