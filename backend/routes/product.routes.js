import { Router } from "express"
import {
  createProduct,
  getVendorProducts,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  getCategories
} from "../controllers/product.controller.js"
import { authenticate } from "../middleware/auth.js"
import upload from "../middleware/multer.js"

const productRouter = Router()

productRouter.get("/", getAllProducts)
productRouter.get("/categories", getCategories)
productRouter.get("/vendor-products", authenticate, getVendorProducts)
productRouter.get("/:id", getProductById)
productRouter.post("/create", authenticate, upload.array("images", 10), createProduct)
productRouter.delete("/delete/:id", authenticate, deleteProduct)
productRouter.put("/update/:id", authenticate, upload.array("images", 10), updateProduct)

export default productRouter
