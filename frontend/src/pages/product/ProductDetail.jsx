import { useState, useEffect } from "react"
import api from "../../api"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useUser } from "../../context/userContext"
import {
  ShoppingCart, Heart, Star, Package, ShieldCheck,
  Truck, ArrowLeft, ChevronRight, Leaf, Minus, Plus
} from "lucide-react"
import "./ProductDetail.css"

const ProductDetail = () => {
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [selectedImage, setSelectedImage] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { id } = useParams()
  const { setCart, wishlist, user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProduct()
    fetchReviews()
    setSelectedImage(0)
    setQuantity(1)
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/${id}`)
      setProduct(res.data.product)
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch product")
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/product/${id}`)
      setReviews(res.data.reviews)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddToCart = async () => {
    if (!user) return navigate("/login")
    try {
      const res = await api.post("/api/cart/add", { productId: id, quantity })
      setCart(res.data.cart)
      toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to cart!`)
    } catch (err) {
      console.error(err)
      toast.error("Failed to add item to cart")
    }
  }

  const handleAddToWishlist = async () => {
    if (!user) return navigate("/login")
    try {
      await api.post("/api/wishlist/add", { productId: id })
      toast.success("Item added to wishlist!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to add item to wishlist")
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) return navigate("/login")
    try {
      const res = await api.post("/api/reviews/add", {
        productId: id,
        ...newReview
      })
      setReviews([...reviews, res.data.review])
      setNewReview({ rating: 5, comment: "" })
      toast.success("Review added successfully!")
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to add review")
    }
  }

  const isProductInWishlist = () => {
    return wishlist?.products?.some(p => p._id === id) || false
  }

  if (loading) {
    return (
      <div className="product-page">
        <div className="product-loading">
          <div className="loading-spinner large"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-page">
        <div className="product-not-found">
          <Leaf size={48} />
          <h2>Product not found</h2>
          <button onClick={() => navigate("/shop")}>Back to Shop</button>
        </div>
      </div>
    )
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const renderStars = (rating, size = 18, interactive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        fill={star <= (interactive ? (hoveredStar || newReview.rating) : Math.round(rating)) ? "currentColor" : "none"}
        className={star <= (interactive ? (hoveredStar || newReview.rating) : Math.round(rating)) ? "star-filled" : "star-empty"}
        onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
        onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
        onClick={interactive ? () => setNewReview({ ...newReview, rating: star }) : undefined}
        style={interactive ? { cursor: 'pointer' } : undefined}
      />
    ))
  }

  return (
    <div className="product-page">
      <div className="product-breadcrumb">
        <button onClick={() => window.history.back()} className="back-btn">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="breadcrumb-path">
          <span onClick={() => navigate("/shop")} className="breadcrumb-link">Shop</span>
          <ChevronRight size={14} />
          <span onClick={() => navigate(`/shop?category=${product.category}`)} className="breadcrumb-link">{product.category}</span>
          <ChevronRight size={14} />
          <span className="breadcrumb-current">{product.name}</span>
        </div>
      </div>

      <div className="product-container">
        <div className="product-main">
          <div className="product-gallery">
            <div className="gallery-main">
              <img
                src={`${api.defaults.baseURL}${product.images[selectedImage]}`}
                alt={product.name}
              />
              {product.stock === 0 && (
                <div className="gallery-sold-out">Sold Out</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="gallery-thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`gallery-thumb ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={`${api.defaults.baseURL}${img}`} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-category-badge">
              <Leaf size={14} /> {product.category}
            </div>

            <h1>{product.name}</h1>

            <div className="product-rating-row">
              <div className="stars">{renderStars(avgRating)}</div>
              <span className="rating-text">{avgRating}</span>
              <span className="review-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>

            <div className="product-price-block">
              <span className="product-price">₹{product.price}</span>
              <span className={`stock-badge ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="product-quantity-row">
              <span className="qty-label">Quantity</span>
              <div className="qty-selector">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="product-actions">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart size={20} />
                <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
              </button>
              <button
                className={`wishlist-btn ${isProductInWishlist() ? 'active' : ''}`}
                onClick={handleAddToWishlist}
              >
                <Heart size={20} fill={isProductInWishlist() ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="product-features">
              <div className="feature-item">
                <div className="feature-icon-wrap"><Truck size={18} /></div>
                <div className="feature-text">
                  <h5>Fast Delivery</h5>
                  <p>In 2-3 business days</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrap"><ShieldCheck size={18} /></div>
                <div className="feature-text">
                  <h5>Secure Transaction</h5>
                  <p>100% encrypted payment</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrap"><Package size={18} /></div>
                <div className="feature-text">
                  <h5>Quality Packaging</h5>
                  <p>Safe and eco-friendly</p>
                </div>
              </div>
            </div>

            <div className="vendor-info">
              <span className="vendor-label">Sold by</span>
              <span className="vendor-name">{product.vendor?.username}</span>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="reviews-summary">
                <div className="avg-rating-big">{avgRating}</div>
                <div className="avg-rating-info">
                  <div className="stars">{renderStars(avgRating)}</div>
                  <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmitReview} className="review-form">
            <h3>Write a Review</h3>
            <div className="review-form-rating">
              <span>Your rating</span>
              <div className="stars interactive">{renderStars(newReview.rating, 22, true)}</div>
            </div>
            <div className="review-form-group">
              <textarea
                required
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                rows="4"
              />
            </div>
            <button type="submit" className="submit-review-btn">
              Submit Review
            </button>
          </form>

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <Star size={32} />
                <p>No reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-card-header">
                    <div className="reviewer-avatar">
                      {review.user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.user?.username}</span>
                      <div className="review-stars">{renderStars(review.rating, 14)}</div>
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
