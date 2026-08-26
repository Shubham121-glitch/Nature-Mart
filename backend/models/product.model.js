import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 0
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  images: {
    type: [String],
    default: []
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  }
}, { timestamps: true });

productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: "text", description: "text" });

const productModel = mongoose.model("products", productSchema);
export default productModel;
