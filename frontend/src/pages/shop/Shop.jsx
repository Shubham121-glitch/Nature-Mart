import { useState, useEffect, useRef } from "react"
import api from "../../api"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { useUser } from "../../context/userContext"
import {
  Search, ShoppingCart, Heart, Leaf, Star, Check,
  SlidersHorizontal, X, ChevronDown, ChevronUp,
  ArrowUpDown, RotateCcw, Sprout, Flower2, Wheat, Wrench,
  FlaskConical, Box, Mountain, Sparkles, Package,
  Droplets, Lightbulb, Bug, Recycle, TreePine
} from 'lucide-react'
import "./Shop.css"

const categoryIcons = {
  "All": Sprout, "Plants": Flower2, "Seeds": Wheat, "Tools": Wrench,
  "Fertilizers": FlaskConical, "Pots": Box, "Soil": Mountain, "Decor": Sparkles,
  "Accessories": Package, "Irrigation": Droplets, "Lighting": Lightbulb,
  "Pest Control": Bug, "Compost": Recycle, "Landscaping": TreePine,
}

const categoryImages = {
  "Plants": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
  "Seeds": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&h=200&fit=crop",
  "Tools": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop&q=80",
  "Fertilizers": "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=200&h=200&fit=crop",
  "Pots": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200&h=200&fit=crop",
  "Soil": "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=200&h=200&fit=crop",
  "Decor": "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200&h=200&fit=crop",
  "Accessories": "https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=200&h=200&fit=crop",
  "Irrigation": "https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=200&h=200&fit=crop&q=60",
  "Lighting": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  "Pest Control": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop",
  "Compost": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=200&h=200&fit=crop",
  "Landscaping": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop&q=70",
}

const CategoryCard = ({ category, label, onClick, className }) => {
  const [imgError, setImgError] = useState(false)
  const Icon = categoryIcons[category] || Sprout
  const imgSrc = categoryImages[category]
  const displayLabel = label || category

  const showImage = imgSrc && !imgError && navigator.onLine

  return (
    <button className={`category-card-tile ${className || ""}`} onClick={onClick}>
      {showImage ? (
        <span className="category-card-img-wrap">
          <img
            src={imgSrc}
            alt={displayLabel}
            className="category-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </span>
      ) : (
        <span className="category-card-icon"><Icon size={28} /></span>
      )}
      <span className="category-card-name">{displayLabel}</span>
    </button>
  )
}

const pricePresets = [
  { label: "Under ₹100", min: "", max: "100" },
  { label: "₹100–500", min: "100", max: "500" },
  { label: "₹500–1k", min: "500", max: "1000" },
  { label: "₹1000+", min: "1000", max: "" },
]

const sortOptions = [
  { value: "createdAt--1", label: "Newest Arrivals" },
  { value: "createdAt-1", label: "Oldest First" },
  { value: "price-1", label: "Price: Low → High" },
  { value: "price--1", label: "Price: High → Low" },
  { value: "name-1", label: "Name: A → Z" },
  { value: "name--1", label: "Name: Z → A" },
]

const Shop = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  const [filters, setFilters] = useState({
    search: new URLSearchParams(location.search).get('search') || "",
    category: new URLSearchParams(location.search).get('category') || "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "-1",
    page: 1
  })

  useEffect(() => {
    const searchParam = new URLSearchParams(location.search).get('search') || ""
    const categoryParam = new URLSearchParams(location.search).get('category') || ""
    setFilters(prev => {
      if (prev.search === searchParam && prev.category === categoryParam) return prev
      return { ...prev, search: searchParam, category: categoryParam, page: 1 }
    })
  }, [location.search])

  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 })
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(true)
  const sortDropdownRef = useRef(null)
  const { setCart, wishlist, setWishlist, user } = useUser()
  const navigate = useNavigate()

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/products/categories")
      setCategories(res.data.categories)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchFeatured = async () => {
    try {
      const res = await api.get("/api/products")
      const shuffled = res.data.products.sort(() => 0.5 - Math.random())
      setFeaturedProducts(shuffled.slice(0, 8))
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key]
      })

      const res = await api.get("/api/products", { params })
      setProducts(res.data.products)
      setPagination({
        totalPages: res.data.totalPages,
        currentPage: res.data.currentPage
      })
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchFeatured()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filters])

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const res = await api.post("/api/cart/add", { productId })
      setCart(res.data.cart)
      toast.success("Added to cart!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to add to cart")
    }
  }

  const handleAddToWishlist = async (e, productId) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const res = await api.post("/api/wishlist/add", { productId })
      setWishlist(res.data.wishlist)
      toast.success("Added to wishlist!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to add to wishlist")
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setFilters({ ...filters, page: 1 })
  }

  const clearSearch = () => {
    setFilters({ ...filters, search: "", page: 1 })
    navigate('/shop')
  }

  const clearAllFilters = () => {
    setFilters({
      search: "", category: "", minPrice: "", maxPrice: "",
      sortBy: "createdAt", sortOrder: "-1", page: 1
    })
  }

  const isProductInWishlist = (productId) => {
    return wishlist?.products?.some(p => p._id === productId) || false
  }

  const hasActiveSearch = filters.search.trim().length > 0
  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice

  const currentSortLabel = sortOptions.find(o => o.value === `${filters.sortBy}-${filters.sortOrder}`)?.label || "Newest Arrivals"

  return (
    <div className="shop-page">
      {!hasActiveSearch && (
        <section className="category-cards-section">
          <div className="category-cards-container">
            <div className="category-cards-header">
              <button className="category-toggle-btn" onClick={() => setShowCategories(!showCategories)}>
                {showCategories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                <span>{showCategories ? "Hide Categories" : "Show Categories"}</span>
              </button>
            </div>
            {showCategories && (
              <div className="category-cards-grid">
                {Object.keys(categoryIcons).filter(cat => cat !== "All").map((category) => (
                  <CategoryCard
                    key={category}
                    category={category}
                    onClick={() => setFilters({ ...filters, category, page: 1 })}
                  />
                ))}
                <CategoryCard
                  category="All"
                  label="View All"
                  className="category-card-all"
                  onClick={() => setFilters({ ...filters, category: "", page: 1 })}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {!hasActiveSearch && featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="featured-header">
            <div className="featured-header-text">
              <h2>Featured Picks</h2>
              <p>Hand-picked selections from our top vendors</p>
            </div>
            <button className="featured-view-all" onClick={() => setFilters({ ...filters, page: 1 })}>
              View All <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
            </button>
          </div>

          <div className="featured-grid">
            {featuredProducts.map((product) => (
              <div key={product._id} className="featured-card" onClick={() => navigate(`/product/${product._id}`)}>
                <div className="featured-card-image">
                  <img src={`${api.defaults.baseURL}${product.images[0]}`} alt={product.name} />
                  {product.stock === 0 && <span className="featured-sold-out">Sold Out</span>}
                </div>
                <div className="featured-card-body">
                  <span className="featured-card-category">{product.category}</span>
                  <h4 className="featured-card-title">{product.name}</h4>
                  <div className="featured-card-footer">
                    <span className="featured-card-price">&#8377;{product.price}</span>
                    <button
                      className="featured-card-cart"
                      onClick={(e) => handleAddToCart(e, product._id)}
                      disabled={product.stock === 0}
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="shop-layout">
        {hasActiveSearch && (
          <form onSubmit={handleSearchSubmit} className="compact-search-bar">
            <div className="compact-search-inner">
              <Search size={18} className="compact-search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <button type="submit" className="compact-search-submit">
                <Search size={16} />
              </button>
              <button type="button" className="compact-search-clear" onClick={clearSearch}>
                <X size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── Inline Filter Bar (Desktop) ── */}
        <div className="filter-bar">
          <div className="filter-bar-categories">
            <button
              className={`filter-pill ${filters.category === "" ? "active" : ""}`}
              onClick={() => setFilters({ ...filters, category: "", page: 1 })}
            >
              All
            </button>
            {categories.map((cat, i) => (
              <button
                key={i}
                className={`filter-pill ${filters.category === cat ? "active" : ""}`}
                onClick={() => setFilters({ ...filters, category: cat, page: 1 })}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-bar-actions">
            <div className="filter-bar-price">
              <div className="filter-price-input">
                <span>₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value, page: 1 })}
                />
              </div>
              <span className="filter-price-dash">–</span>
              <div className="filter-price-input">
                <span>₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value, page: 1 })}
                />
              </div>
            </div>

            <div className={`filter-sort-dropdown ${sortDropdownOpen ? 'open' : ''}`} ref={sortDropdownRef}>
              <div
                className="filter-sort-trigger"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                <ArrowUpDown size={14} />
                <span>{currentSortLabel}</span>
                <ChevronDown size={14} className="filter-sort-arrow" />
              </div>
              <div className="filter-sort-menu">
                {sortOptions.map((option) => {
                  const currentVal = `${filters.sortBy}-${filters.sortOrder}`
                  const isSelected = option.value === currentVal
                  return (
                    <div
                      key={option.value}
                      className={`filter-sort-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        const [sortBy, sortOrder] = option.value.split("-")
                        setFilters({ ...filters, sortBy, sortOrder, page: 1 })
                        setSortDropdownOpen(false)
                      }}
                    >
                      {option.label}
                      {isSelected && <Check size={14} />}
                    </div>
                  )
                })}
              </div>
            </div>

            {hasActiveFilters && (
              <button className="filter-clear-btn" onClick={clearAllFilters}>
                <RotateCcw size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile Filter Hamburger ── */}
        <button className="mobile-filter-toggle" onClick={() => setShowMobileFilters(true)}>
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {hasActiveFilters && <span className="filter-active-dot"></span>}
        </button>

        {/* ── Mobile Filter Drawer ── */}
        {showMobileFilters && (
          <div className="mobile-filter-overlay" onClick={() => setShowMobileFilters(false)}></div>
        )}
        <div className={`mobile-filter-drawer ${showMobileFilters ? 'open' : ''}`}>
          <div className="drawer-header">
            <h3><SlidersHorizontal size={18} /> Filters</h3>
            <button className="drawer-close" onClick={() => setShowMobileFilters(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="drawer-body">
            <div className="drawer-section">
              <label className="drawer-label">Category</label>
              <div className="drawer-pills">
                <button
                  className={`filter-pill ${filters.category === "" ? "active" : ""}`}
                  onClick={() => setFilters({ ...filters, category: "", page: 1 })}
                >
                  All
                </button>
                {categories.map((cat, i) => (
                  <button
                    key={i}
                    className={`filter-pill ${filters.category === cat ? "active" : ""}`}
                    onClick={() => setFilters({ ...filters, category: cat, page: 1 })}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="drawer-divider"></div>

            <div className="drawer-section">
              <label className="drawer-label">Price Range</label>
              <div className="drawer-price-row">
                <div className="filter-price-input">
                  <span>₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value, page: 1 })}
                  />
                </div>
                <span className="filter-price-dash">–</span>
                <div className="filter-price-input">
                  <span>₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value, page: 1 })}
                  />
                </div>
              </div>
              <div className="drawer-presets">
                {pricePresets.map((preset, i) => (
                  <button
                    key={i}
                    className="drawer-preset"
                    onClick={() => setFilters({ ...filters, minPrice: preset.min, maxPrice: preset.max, page: 1 })}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="drawer-divider"></div>

            <div className="drawer-section">
              <label className="drawer-label">Sort By</label>
              <div className="drawer-sort-options">
                {sortOptions.map((option) => {
                  const currentVal = `${filters.sortBy}-${filters.sortOrder}`
                  const isSelected = option.value === currentVal
                  return (
                    <button
                      key={option.value}
                      className={`drawer-sort-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        const [sortBy, sortOrder] = option.value.split("-")
                        setFilters({ ...filters, sortBy, sortOrder, page: 1 })
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="drawer-footer">
            {hasActiveFilters && (
              <button className="drawer-clear-btn" onClick={clearAllFilters}>
                <RotateCcw size={14} /> Clear All Filters
              </button>
            )}
            <button className="drawer-apply-btn" onClick={() => setShowMobileFilters(false)}>
              Show Results
            </button>
          </div>
        </div>

        <div className="shop-main">
          <div className="results-header">
            <h2>
              {hasActiveSearch ? (
                <>Results for "<span className="search-highlight">{filters.search}</span>"</>
              ) : (
                filters.category || "All Products"
              )}
            </h2>
            <span className="results-count">
              {loading ? "Loading..." : (
                hasActiveSearch
                  ? `${products.length} product${products.length !== 1 ? 's' : ''} found`
                  : `Showing results page ${pagination.currentPage}`
              )}
            </span>
          </div>

          <div className="products-grid">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton img-skeleton"></div>
                  <div className="skeleton text-skeleton"></div>
                  <div className="skeleton text-skeleton short"></div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">
                  <Leaf size={48} />
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query.</p>
                <button className="reset-btn" onClick={clearAllFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              products.map((product, i) => (
                <div
                  key={product._id}
                  className="product-card"
                  onClick={() => navigate(`/product/${product._id}`)}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="product-image-wrapper">
                    <img
                      src={`${api.defaults.baseURL}${product.images[0]}`}
                      alt={product.name}
                      loading="lazy"
                    />
                    <div className="product-image-overlay" />
                    <span className="product-badge-category">{product.category}</span>
                    {product.stock === 0 && (
                      <span className="product-badge-stock">Sold Out</span>
                    )}
                    <button
                      className={`product-wishlist ${isProductInWishlist(product._id) ? 'active' : ''}`}
                      onClick={(e) => handleAddToWishlist(e, product._id)}
                    >
                      <Heart size={16} fill={isProductInWishlist(product._id) ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="product-body">
                    <div className="product-top">
                      <h3 className="product-name">{product.name}</h3>
                      {product.vendor && (
                        <span className="product-vendor">by {product.vendor.username}</span>
                      )}
                    </div>

                    <div className="product-bottom">
                      <div className="product-pricing">
                        <span className="product-price">&#8377;{product.price}</span>
                        <div className="product-rating">
                          <Star size={13} fill="#f59e0b" strokeWidth={0} />
                          <span>-</span>
                        </div>
                      </div>
                      <button
                        className="product-cart-btn"
                        onClick={(e) => handleAddToCart(e, product._id)}
                        disabled={product.stock === 0}
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && products.length > 0 && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={pagination.currentPage === 1}
                onClick={() => setFilters({ ...filters, page: pagination.currentPage - 1 })}
              >
                Previous
              </button>

              <div className="page-numbers">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`page-num ${pagination.currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setFilters({ ...filters, page: i + 1 })}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                className="page-btn"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: pagination.currentPage + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Shop
