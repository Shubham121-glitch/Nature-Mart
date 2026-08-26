import { Router } from "express"
import {
  getProductReviews,
  addReview,
  deleteReview
} from "../controllers/review.controller.js"
import { authenticate } from "../middleware/auth.js"

const reviewRouter = Router()

reviewRouter.get("/product/:productId", getProductReviews)
reviewRouter.post("/add", authenticate, addReview)
reviewRouter.delete("/:reviewId", authenticate, deleteReview)

export default reviewRouter
