import { useState, useEffect, useRef } from "react"
import "./navbar.css"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useUser } from "../context/userContext"
import { toast } from "react-toastify"
import {
  ShoppingBag, Heart, Package, Bell, LayoutDashboard,
  ShoppingCart, LogOut, Sun, Moon, Menu, X, Leaf, User, ChevronDown,
  Search, MapPin, ChevronRight, Store, Sparkles, Shield
} from "lucide-react"

const Navbar = () => {
  const { user, logout, cart, wishlist, notifications, darkMode, setDarkMode } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const userMenuRef = useRef(null)
  const catDropRef = useRef(null)

  const searchCategories = [
    "All", "Plants", "Seeds", "Tools", "Fertilizers",
    "Pots", "Soil", "Decor", "Accessories"
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => { setShowMobileMenu(false) }, [location])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
      if (catDropRef.current && !catDropRef.current.contains(e.target)) setShowCategoryDropdown(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    const catParam = selectedCategory !== "All" ? `&category=${encodeURIComponent(selectedCategory)}` : ""
    if (query || catParam) {
      navigate(`/?search=${encodeURIComponent(query)}${catParam}`)
    } else {
      navigate("/")
    }
    setShowMobileMenu(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully!")
      navigate("/login")
    } catch (err) {
      console.error(err)
      toast.error("Logout failed")
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const cartCount = cart?.items?.length || 0
  const wishlistCount = wishlist?.products?.length || 0

  if (!user) return null

  const isActive = (path) => location.pathname === path

  const categoryLinks = [
    { label: "Shop All", path: "/" },
    { label: "Plants", path: "/?category=Plants" },
    { label: "Seeds", path: "/?category=Seeds" },
    { label: "Tools", path: "/?category=Tools" },
    { label: "Pots", path: "/?category=Pots" },
    { label: "Soil", path: "/?category=Soil" },
    { label: "Decor", path: "/?category=Decor" },
    { label: "Accessories", path: "/?category=Accessories" },
  ]

  if (user.accountType === "vendor") {
    categoryLinks.push({ label: "Vendor Dashboard", path: "/vendor-dashboard" })
  }

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="topbar">
        <div className="topbar-container">
          <div className="topbar-left">
            <Link to="/" className="topbar-logo">
              <div className="topbar-logo-icon">
                <Leaf size={18} />
              </div>
              <span>Nature Mart</span>
            </Link>
          </div>

          <div className="topbar-center">
            <button className="topbar-location">
              <MapPin size={14} />
              <div>
                <span className="topbar-location-label">Deliver to</span>
                <span className="topbar-location-value">{user.username}</span>
              </div>
            </button>
          </div>

          <div className="topbar-right">
            <Link to="/wishlist" className={`topbar-link ${isActive("/wishlist") ? "active" : ""}`}>
              <Heart size={16} />
              <span>Wishlist</span>
              {wishlistCount > 0 && <span className="topbar-badge">{wishlistCount}</span>}
            </Link>
            <Link to="/admin/login" className="topbar-link topbar-admin-link">
              <Shield size={16} />
              <span>Admin</span>
            </Link>
            <Link to="/orders" className={`topbar-link ${isActive("/orders") ? "active" : ""}`}>
              <Package size={16} />
              <span>Orders</span>
            </Link>
            <Link to="/notifications" className={`topbar-link ${isActive("/notifications") ? "active" : ""}`}>
              <Bell size={16} />
              <span>Alerts</span>
              {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Mobile: Logo only */}
          <Link to="/" className="navbar-logo" id="nav-logo">
            <div className="logo-icon">
              <Leaf size={20} />
            </div>
            <span className="logo-text">Nature Mart</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="navbar-search">
            <div className="search-category-wrapper" ref={catDropRef}>
              <button
                type="button"
                className="search-category-btn"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <span>{selectedCategory}</span>
                <ChevronDown size={14} />
              </button>
              {showCategoryDropdown && (
                <div className="search-category-dropdown">
                  {searchCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`search-category-option ${selectedCategory === cat ? "active" : ""}`}
                      onClick={() => { setSelectedCategory(cat); setShowCategoryDropdown(false) }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Search Nature Mart..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit-btn" aria-label="Search">
              <Search size={20} />
            </button>
          </form>

          {/* Right Actions */}
          <div className="navbar-right">
            {/* Dark Mode */}
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              id="dark-mode-toggle"
              aria-label="Toggle dark mode"
            >
              <div className={`toggle-track ${darkMode ? "dark" : ""}`}>
                <div className="toggle-thumb">
                  {darkMode ? <Moon size={14} /> : <Sun size={14} />}
                </div>
              </div>
            </button>

            {/* User Menu */}
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                id="user-menu-btn"
              >
                <div className="avatar">
                  <User size={15} />
                  <span className="online-dot"></span>
                </div>
                <div className="user-info-text">
                  <span className="user-greeting">Hello, {user.username}</span>
                  <span className="user-account-label">Account <ChevronDown size={12} /></span>
                </div>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="dropdown-name">{user.username}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <User size={16} />
                    <span>Your Profile</span>
                  </Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <Package size={16} />
                    <span>Your Orders</span>
                  </Link>
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <Heart size={16} />
                    <span>Your Wishlist</span>
                  </Link>
                  {user.accountType === "user" && (
                    <Link to="/dashboard" className="dropdown-item vendor-link" onClick={() => setShowUserMenu(false)}>
                      <Sparkles size={16} />
                      <span>Be Vendor</span>
                    </Link>
                  )}
                  {user.accountType === "vendor" && (
                    <Link to="/vendor-dashboard" className="dropdown-item vendor-link" onClick={() => setShowUserMenu(false)}>
                      <Store size={16} />
                      <span>Vendor Dashboard</span>
                    </Link>
                  )}
                  <Link to="/admin/login" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                    <Shield size={16} />
                    <span>Admin Panel</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout} id="logout-btn">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className={`nav-cart-link ${isActive("/cart") ? "active" : ""}`} id="nav-cart-btn">
              <div className="cart-icon-wrapper">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="cart-count">{cartCount > 9 ? "9+" : cartCount}</span>
                )}
              </div>
              <span className="cart-text">Cart</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Category Nav ── */}
      <div className="category-nav">
        <div className="category-nav-container">
          <div className="category-nav-left">
            <button
              className="category-all-btn"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu size={18} />
              <span>All</span>
            </button>
            {categoryLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`category-nav-link ${
                  (link.path === "/" && location.pathname === "/" && location.search === "") ||
                  location.search.includes(link.path.split("?")[1] || "__none__")
                    ? "active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="category-nav-right">
            <button className="theme-toggle-nav" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div className={`mobile-menu-overlay ${showMobileMenu ? "open" : ""}`} onClick={() => setShowMobileMenu(false)} />
      <div className={`mobile-menu ${showMobileMenu ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-user-info">
            <div className="mobile-avatar">
              <User size={20} />
            </div>
            <div>
              <p className="mobile-username">{user.username}</p>
              <p className="mobile-email">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="mobile-nav-section">
          <h4 className="mobile-nav-section-title">Shop</h4>
          {categoryLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${
                (link.path === "/" && location.search === "") ||
                location.search.includes(link.path.split("?")[1] || "__none__")
                  ? "active" : ""
              }`}
            >
              <span>{link.label}</span>
              <ChevronRight size={16} />
            </Link>
          ))}
        </div>

        <div className="mobile-nav-section">
          <h4 className="mobile-nav-section-title">Account</h4>
          <Link to="/dashboard" className="mobile-nav-link">
            <User size={18} />
            <span>Your Profile</span>
          </Link>
          <Link to="/orders" className="mobile-nav-link">
            <Package size={18} />
            <span>Your Orders</span>
          </Link>
          <Link to="/wishlist" className="mobile-nav-link">
            <Heart size={18} />
            <span>Your Wishlist</span>
          </Link>
          {user.accountType === "user" && (
            <Link to="/dashboard" className="mobile-nav-link">
              <Sparkles size={18} />
              <span>Be Vendor</span>
            </Link>
          )}
          {user.accountType === "vendor" && (
            <Link to="/vendor-dashboard" className="mobile-nav-link">
              <Store size={18} />
              <span>Vendor Dashboard</span>
            </Link>
          )}
          <Link to="/cart" className="mobile-nav-link">
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && <span className="mobile-badge">{cartCount}</span>}
          </Link>
          <Link to="/notifications" className="mobile-nav-link">
            <Bell size={18} />
            <span>Alerts</span>
            {unreadCount > 0 && <span className="mobile-badge">{unreadCount}</span>}
          </Link>
        </div>

        <div className="mobile-menu-footer">
          <button className="mobile-theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button className="mobile-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Navbar
