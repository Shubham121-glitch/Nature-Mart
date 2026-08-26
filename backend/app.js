import express from "express"
import morgan from "morgan"
import authRouter from "./routes/auth.routes.js"
import productRouter from "./routes/product.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderRouter from "./routes/order.routes.js"
import wishlistRouter from "./routes/wishlist.routes.js"
import reviewRouter from "./routes/review.routes.js"
import notificationRouter from "./routes/notification.routes.js"
import adminRouter from "./routes/admin.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json())
app.use(morgan("dev"))
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}))
app.use(cookieParser())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/auth", authRouter)
app.use("/api/products", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/orders", orderRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/admin", adminRouter)

app.use((err, req, res, next) => {
  console.error(err.stack)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    message: err.message || "Internal server error"
  })
})

export default app
