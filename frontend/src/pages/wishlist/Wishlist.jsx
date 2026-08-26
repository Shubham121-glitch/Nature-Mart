import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api"
import { toast } from "react-toastify"
import { useUser } from "../../context/userContext"
import {
  Heart, Trash2, ShoppingCart, ArrowRight
} from "lucide-react"
import "./Wishlist.css"

const Wishlist = () => {
  const { wishlist, setWishlist, setCart, user } = useUser()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate("/login")
    } else {
      setLoading(false)
    }
  }, [user, navigate])

  const handleRemoveItem = async (productId) => {
    try {
      const res = await api.delete(`/api/wishlist/remove/${productId}`)
      setWishlist(res.data.wishlist)
      toast.success("Removed from wishlist")
    } catch (err) {
      toast.error("Failed to remove item")
    }
  }

  const handleMoveToCart = async (productId) => {
    try {
      const cartRes = await api.post("/api/cart/add",
        { productId }
      )
      setCart(cartRes.data.cart)

      const wishRes = await api.delete(`/api/wishlist/remove/${productId}`)
      setWishlist(wishRes.data.wishlist)

      toast.success("Moved to cart!")
    } catch (err) {
      toast.error("Failed to move to cart")
    }
  }

  if (loading) return (
    <div className="page-loading">
      <div className="loading-spinner large"></div>
    </div>
  )

  const wishlistItems = wishlist?.products || []

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header-section">
          <h1 className="page-title">
            <Heart className="title-icon" />
            Your Wishlist
          </h1>
          <p className="wishlist-subtitle">Items you've saved for later.</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon-wrapper">
              <Heart size={60} />
            </div>
            <h2>No favorites yet?</h2>
            <p>Save items you love here to easily find them later.</p>
            <button className="explore-btn" onClick={() => navigate("/")}>
              <span>Explore Products</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((product, i) => (
              <div
                key={product._id}
                className="wishlist-card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="wishlist-image-wrapper">
                  <img
                    src={`${api.defaults.baseURL}${product.images[0]}`}
                    alt={product.name}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                  {product.stock === 0 && (
                    <span className="out-of-stock-badge">Sold Out</span>
                  )}
                  <button
                    className="remove-wishlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(product._id);
                    }}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="wishlist-info">
                  <span className="wishlist-category">{product.category}</span>
                  <h3 onClick={() => navigate(`/product/${product._id}`)}>{product.name}</h3>
                  <div className="wishlist-price-row">
                    <span className="wishlist-price">&#8377;{product.price}</span>
                  </div>

                  <button
                    className="move-to-cart-btn"
                    onClick={() => handleMoveToCart(product._id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? (
                      <span>Out of Stock</span>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        <span>Move to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
