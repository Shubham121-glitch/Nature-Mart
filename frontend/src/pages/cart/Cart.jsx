import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api"
import { toast } from "react-toastify"
import { useUser } from "../../context/userContext"
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight,
  Leaf, Truck, ShieldCheck, ChevronRight
} from "lucide-react"
import "./Cart.css"

const Cart = () => {
  const { cart, setCart, user, fetchUserData } = useUser()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [address, setAddress] = useState("")

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      const res = await api.put(`/api/cart/update/${itemId}`,
        { quantity: newQuantity }
      )
      setCart(res.data.cart)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quantity")
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await api.delete(`/api/cart/remove/${itemId}`)
      setCart(res.data.cart)
      toast.success("Item removed from cart")
    } catch {
      toast.error("Failed to remove item")
    }
  }

  const handleCheckout = async () => {
    if (!address) {
      return toast.error("Please provide a shipping address")
    }
    try {
      setCheckingOut(true)
      const res = await api.post("/api/orders/create",
        { shippingAddress: address, paymentMethod: "Cash on Delivery" }
      )
      toast.success(res.data.message || "Order placed successfully!")
      await fetchUserData()
      navigate("/orders")
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed")
    } finally {
      setCheckingOut(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login")
    } else {
      setLoading(false)
      if (user.address) {
        setAddress(`${user.address.state}, ${user.address.district}, ${user.address.tehsil}, ${user.address.pin}`)
      }
    }
  }, [user, navigate])

  if (loading) return (
    <div className="page-loading">
      <div className="loading-spinner large"></div>
    </div>
  )

  const cartItems = cart?.items || []
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + (cartItems.length > 0 ? shipping : 0)

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="page-title">
          <ShoppingBag className="title-icon" />
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon-wrapper">
              <Leaf size={60} />
            </div>
            <h2>Your cart is looking a little empty</h2>
            <p>Add some fresh organic products to your cart and they will show up here.</p>
            <button className="continue-shopping-btn" onClick={() => navigate("/")}>
              <span>Start Shopping</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-section">
              <div className="cart-header">
                <span>Product</span>
                <span>Quantity</span>
                <span>Total</span>
              </div>

              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="cart-item">
                    <div className="item-main">
                      <img
                        src={`${api.defaults.baseURL}${item.product.images[0]}`}
                        alt={item.product.name}
                        className="item-image"
                        onClick={() => navigate(`/product/${item.product._id}`)}
                      />
                      <div className="item-details">
                        <span className="item-category">{item.product.category}</span>
                        <h3 onClick={() => navigate(`/product/${item.product._id}`)}>
                          {item.product.name}
                        </h3>
                        <p className="item-price">&#8377;{item.product.price}</p>
                      </div>
                    </div>

                    <div className="item-quantity-wrapper">
                      <div className="quantity-controls">
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="remove-item-btn"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="item-total">
                      &#8377;{item.product.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cart-summary-section">
              <div className="summary-card">
                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>&#8377;{subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping Estimate</span>
                  <span>{shipping === 0 ? "Free" : `&#8377;${shipping.toFixed(2)}`}</span>
                </div>

                {shipping > 0 && (
                  <div className="shipping-notice">
                    Add &#8377;{(500 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>&#8377;{total.toFixed(2)}</span>
                </div>

                <div className="shipping-address-input">
                  <label>Shipping Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full shipping address..."
                    rows="3"
                  />
                </div>

                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={checkingOut || cartItems.length === 0}
                >
                  {checkingOut ? (
                    <div className="btn-loading">
                      <div className="loading-spinner small"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>

                <div className="trust-badges">
                  <div className="trust-badge">
                    <ShieldCheck size={16} />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="trust-badge">
                    <Truck size={16} />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
