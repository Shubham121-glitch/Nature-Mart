import mongoose from "mongoose";

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Pending"
  },
  trackingHistory: {
    type: [trackingEventSchema],
    default: []
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    type: Object
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "UPI", "Card"],
    default: "COD"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending"
  }
}, { timestamps: true });

orderSchema.index({ user: 1 });
orderSchema.index({ "items.vendor": 1 });

const orderModel = mongoose.model("orders", orderSchema);
export default orderModel;
