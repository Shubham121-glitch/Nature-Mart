import reviewModel from "../models/review.model.js"
import productModel from "../models/product.model.js"

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params
    const reviews = await reviewModel.find({ product: productId }).populate("user", "username")
    res.status(200).json({ reviews })
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message })
  }
}

export const addReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const { productId, rating, comment } = req.body
    const product = await productModel.findById(productId)
    if (!product) return res.status(404).json({ message: "Product not found" })

    const existingReview = await reviewModel.findOne({ user: userId, product: productId })
    if (existingReview) return res.status(400).json({ message: "Review already exists" })

    const review = await reviewModel.create({
      product: productId,
      user: userId,
      rating,
      comment
    })

    await review.populate("user", "username")
    res.status(201).json({ message: "Review added successfully", review })
  } catch (err) {
    res.status(500).json({ message: "Failed to add review", error: err.message })
  }
}

export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const { reviewId } = req.params
    const review = await reviewModel.findById(reviewId)
    if (!review) return res.status(404).json({ message: "Review not found" })

    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await reviewModel.findByIdAndDelete(reviewId)
    res.status(200).json({ message: "Review deleted" })
  } catch (err) {
    res.status(500).json({ message: "Failed to delete review", error: err.message })
  }
}
