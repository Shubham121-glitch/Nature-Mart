import wishlistModel from "../models/wishlist.model.js"
import productModel from "../models/product.model.js"

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    let wishlist = await wishlistModel.findOne({ user: userId }).populate("products")
    if (!wishlist) {
      wishlist = await wishlistModel.create({ user: userId, products: [] })
    }
    res.status(200).json({ wishlist })
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: err.message })
  }
}

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const { productId } = req.body
    const product = await productModel.findById(productId)
    if (!product) return res.status(404).json({ message: "Product not found" })

    let wishlist = await wishlistModel.findOne({ user: userId })
    if (!wishlist) wishlist = await wishlistModel.create({ user: userId, products: [] })

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId)
      await wishlist.save()
    }

    await wishlist.populate("products")
    res.status(200).json({ message: "Item added to wishlist", wishlist })
  } catch (err) {
    res.status(500).json({ message: "Failed to add item to wishlist", error: err.message })
  }
}

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const { productId } = req.params
    const wishlist = await wishlistModel.findOne({ user: userId })
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" })

    wishlist.products = wishlist.products.filter(p => p.toString() !== productId)
    await wishlist.save()
    await wishlist.populate("products")
    res.status(200).json({ message: "Item removed from wishlist", wishlist })
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item from wishlist", error: err.message })
  }
}
