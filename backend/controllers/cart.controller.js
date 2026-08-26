import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js"

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await cartModel.findOne({ user: userId }).populate({
      path: "items.product",
      model: productModel
    })
    if (!cart) {
      cart = await cartModel.create({ user: userId, items: [] })
    }
    res.status(200).json({ cart })
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err.message })
  }
}

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { productId, quantity = 1 } = req.body
    const product = await productModel.findById(productId)
    if (!product) return res.status(404).json({ message: "Product not found" })

    let cart = await cartModel.findOne({ user: userId })
    if (!cart) cart = await cartModel.create({ user: userId, items: [] })

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    )

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity
    } else {
      cart.items.push({ product: productId, quantity })
    }

    await cart.save()
    await cart.populate("items.product")
    res.status(200).json({ message: "Item added to cart", cart })
  } catch (err) {
    res.status(500).json({ message: "Failed to add item to cart", error: err.message })
  }
}

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { itemId } = req.params
    const cart = await cartModel.findOne({ user: userId })
    if (!cart) return res.status(404).json({ message: "Cart not found" })

    cart.items = cart.items.filter(item => item._id.toString() !== itemId)
    await cart.save()
    await cart.populate("items.product")
    res.status(200).json({ message: "Item removed from cart", cart })
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item from cart", error: err.message })
  }
}

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;

    const { itemId } = req.params
    const { quantity } = req.body
    const cart = await cartModel.findOne({ user: userId })
    if (!cart) return res.status(404).json({ message: "Cart not found" })

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId)
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" })

    cart.items[itemIndex].quantity = quantity
    await cart.save()
    await cart.populate("items.product")
    res.status(200).json({ message: "Cart item updated", cart })
  } catch (err) {
    res.status(500).json({ message: "Failed to update cart item", error: err.message })
  }
}

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await cartModel.findOneAndUpdate({ user: userId }, { items: [] })
    res.status(200).json({ message: "Cart cleared" })
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart", error: err.message })
  }
}
