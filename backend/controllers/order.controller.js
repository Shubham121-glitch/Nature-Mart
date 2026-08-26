import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import notificationModel from "../models/notification.model.js";

const getStatusDescription = (status) => {
  const descriptions = {
    "Pending": "Your order has been received and is awaiting processing",
    "Processing": "Your order is being processed and prepared for shipment",
    "Shipped": "Your order has been shipped and is on the way",
    "Out for Delivery": "Your order is out for delivery",
    "Delivered": "Your order has been delivered successfully",
    "Cancelled": "Your order has been cancelled"
  };
  return descriptions[status] || "Status updated";
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await cartModel.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}`
        });
      }
    }

    const { shippingAddress, paymentMethod } = req.body;

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      vendor: item.product.vendor,
      quantity: item.quantity,
      price: item.product.price,
      status: "Pending",
      trackingHistory: [{
        status: "Pending",
        description: getStatusDescription("Pending"),
        timestamp: new Date()
      }]
    }));

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const order = await orderModel.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: "Completed"
    });

    for (const item of cart.items) {
      await productModel.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });

      await notificationModel.create({
        user: item.product.vendor,
        message: `New order received for ${item.product.name}`,
        type: "Order"
      });
    }

    await cartModel.findOneAndUpdate({ user: userId }, { items: [] });
    await notificationModel.create({
      user: userId,
      message: "Your order has been placed successfully",
      type: "Order"
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await orderModel.find({ user: userId }).populate({
      path: "items.product",
      model: productModel
    }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const orders = await orderModel.find({ "items.vendor": vendorId }).populate({
      path: "items.product",
      model: productModel
    }).populate("user", "username email").sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

export const updateOrderItemStatus = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const { orderId, itemId } = req.params;
    const { status, location, description } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const itemIndex = order.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found" });

    const item = order.items[itemIndex];
    if (item.vendor.toString() !== vendorId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    item.status = status;
    item.trackingHistory.push({
      status,
      description: description || getStatusDescription(status),
      location,
      timestamp: new Date()
    });

    await order.save();

    await notificationModel.create({
      user: order.user,
      message: `Order status for ${item.product} has been updated to ${status}`,
      type: "Order"
    });

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};

export const getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const orders = await orderModel.find({ "items.vendor": vendorId });

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalItemsSold = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.vendor.toString() === vendorId && item.status !== "Cancelled") {
          totalRevenue += item.price * item.quantity;
          totalItemsSold += item.quantity;
        }
      });
      if (order.items.some(item => item.vendor.toString() === vendorId)) {
        totalOrders++;
      }
    });

    const vendorProducts = await productModel.find({ vendor: vendorId });
    const totalProducts = vendorProducts.length;

    res.status(200).json({
      totalRevenue,
      totalOrders,
      totalItemsSold,
      totalProducts
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
  }
};
