import { useState, useEffect } from "react"
import api from "../../api"
import { toast } from "react-toastify"
import { useUser } from "../../context/userContext"
import { useNavigate } from "react-router-dom"
import {
  Package, LayoutDashboard, ShoppingBag, DollarSign, Plus, X,
  Trash2, MapPin, ShoppingCart
} from "lucide-react"
import "./VendorDashboard.css"

const VendorDashboard = () => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [expandedOrderItem, setExpandedOrderItem] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: []
  })
  const { user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    if (user.accountType !== "vendor") {
      navigate("/")
      return
    }
    fetchData()
  }, [user, navigate])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes, analyticsRes] = await Promise.all([
        api.get("/api/products/vendor-products"),
        api.get("/api/orders/vendor"),
        api.get("/api/orders/analytics")
      ])
      setProducts(productsRes.data.products)
      setOrders(ordersRes.data.orders)
      setAnalytics(analyticsRes.data)
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, images: e.target.files }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formDataToSend = new FormData()
    formDataToSend.append("name", formData.name)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("price", formData.price)
    formDataToSend.append("category", formData.category)
    formDataToSend.append("stock", formData.stock)
    Array.from(formData.images).forEach(file => {
      formDataToSend.append("images", file)
    })

    try {
      await api.post("/api/products/create", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      toast.success("Product created successfully")
      setShowUploadForm(false)
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        images: []
      })
      fetchData()
    } catch (err) {
      toast.error("Failed to create product")
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    try {
      await api.delete(`/api/products/delete/${productId}`)
      toast.success("Product deleted successfully")
      fetchData()
    } catch (err) {
      toast.error("Failed to delete product")
    }
  }

  const handleUpdateOrderStatus = async (orderId, itemId, status, location = "", description = "") => {
    if (!status) {
      toast.error("Please select a status")
      return
    }

    try {
      await api.put(`/api/orders/${orderId}/item/${itemId}/status`, {
        status,
        location,
        description
      })
      toast.success("Order status updated successfully!")
      setSelectedOrder(null)
      setExpandedOrderItem(null)
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error("Failed to update status")
    }
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      "Pending": "status-pending",
      "Processing": "status-processing",
      "Shipped": "status-shipped",
      "Out for Delivery": "status-out-for-delivery",
      "Delivered": "status-delivered",
      "Cancelled": "status-cancelled"
    }
    return classes[status] || "status-pending"
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading vendor dashboard...</p>
      </div>
    )
  }

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Vendor Dashboard</h1>
          <p>Welcome back, {user?.username}!</p>
        </div>
        <div className="header-actions">
          {activeTab === "products" && (
            <button
              className="add-product-btn"
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </button>
        <button
          className={`dashboard-tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <ShoppingBag size={18} />
          <span>Products</span>
        </button>
        <button
          className={`dashboard-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <Package size={18} />
          <span>Orders</span>
        </button>
      </div>

      {activeTab === "overview" && analytics && (
        <div className="overview-section">
          <div className="analytics-grid">
            <div className="stat-card revenue">
              <div className="stat-icon"><DollarSign size={24} /></div>
              <div className="stat-content">
                <p className="stat-value">&#8377;{analytics.totalRevenue?.toFixed(2) || 0}</p>
                <p className="stat-label">Total Revenue</p>
              </div>
            </div>
            <div className="stat-card orders">
              <div className="stat-icon"><Package size={24} /></div>
              <div className="stat-content">
                <p className="stat-value">{analytics.totalOrders || 0}</p>
                <p className="stat-label">Total Orders</p>
              </div>
            </div>
            <div className="stat-card items">
              <div className="stat-icon"><ShoppingCart size={24} /></div>
              <div className="stat-content">
                <p className="stat-value">{analytics.totalItemsSold || 0}</p>
                <p className="stat-label">Items Sold</p>
              </div>
            </div>
            <div className="stat-card products">
              <div className="stat-icon"><ShoppingBag size={24} /></div>
              <div className="stat-content">
                <p className="stat-value">{analytics.totalProducts || 0}</p>
                <p className="stat-label">Total Products</p>
              </div>
            </div>
          </div>

          <div className="recent-orders">
            <h3>Recent Orders</h3>
            {orders.length === 0 ? (
              <div className="no-data">No orders yet</div>
            ) : (
              <div className="orders-list-small">
                {orders.slice(0, 5).map(order => (
                  <div key={order._id} className="order-item-small">
                    <div>
                      <p className="order-id-small">Order #{order._id.slice(-8)}</p>
                      <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="order-total-small">&#8377;{order.totalAmount}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="products-section">
          {showUploadForm && (
            <div className="product-form-modal">
              <div className="product-form-container">
                <div className="form-header">
                  <h2>Add New Product</h2>
                  <button
                    className="close-btn"
                    onClick={() => setShowUploadForm(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="product-form">
                  <div className="form-group">
                    <label htmlFor="name">Product Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="price">Price</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="stock">Stock</label>
                      <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="images">Product Images</label>
                    <input
                      type="file"
                      id="images"
                      name="images"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                  </div>

                  <div className="form-buttons">
                    <button type="button" className="cancel-btn" onClick={() => setShowUploadForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">Create Product</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="products-grid">
            {products.length === 0 ? (
              <div className="no-data">
                <h3>No Products Yet</h3>
                <p>Add your first product to get started!</p>
              </div>
            ) : (
              products.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image-wrapper">
                    {product.images.length > 0 && (
                      <img
                        src={`${api.defaults.baseURL}${product.images[0]}`}
                        alt={product.name}
                        className="product-image"
                      />
                    )}
                  </div>
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-meta">
                      <span className="product-price">&#8377;{product.price}</span>
                      <span className={`stock-badge ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </div>
                    <p className="product-category">Category: {product.category}</p>
                    <button
                      className="delete-product-btn"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="orders-section">
          {orders.length === 0 ? (
            <div className="no-data">
              <h3>No Orders Yet</h3>
              <p>When customers order your products, they will appear here!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-id">Order #{order._id.slice(-8)}</div>
                      <div className="customer-info">
                        <p className="customer-name">Customer: {order.user?.username} ({order.user?.email})</p>
                        <p className="order-date">Date: {new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="order-total">Total: &#8377;{order.totalAmount}</div>
                  </div>

                  {order.shippingAddress && (
                    <div className="shipping-address">
                      <h4>Shipping Address</h4>
                      <p>{order.shippingAddress?.state}, {order.shippingAddress?.district}, {order.shippingAddress?.tehsil}, {order.shippingAddress?.pin}</p>
                    </div>
                  )}

                  <div className="order-items">
                    {order.items.filter(item => item.vendor?.toString() === user._id).map((item) => (
                      <div key={item._id} className="order-item">
                        <img
                          src={`${api.defaults.baseURL}${item.product?.images[0]}`}
                          alt={item.product?.name}
                          className="order-item-image"
                        />
                        <div className="order-item-details">
                          <div className="item-info">
                            <h4>{item.product?.name}</h4>
                            <p>Qty: {item.quantity} &#215; &#8377;{item.price}</p>
                            <p className="item-subtotal">Subtotal: &#8377;{item.quantity * item.price}</p>
                            <div className="status-display">
                              <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                          <div className="order-actions">
                            <button
                              className="view-details-btn"
                              onClick={() => {
                                if (expandedOrderItem === item._id) {
                                  setExpandedOrderItem(null)
                                  setSelectedOrder(null)
                                } else {
                                  setExpandedOrderItem(item._id)
                                  setSelectedOrder({
                                    orderId: order._id,
                                    itemId: item._id,
                                    currentStatus: item.status
                                  })
                                }
                              }}
                            >
                              {expandedOrderItem === item._id ? "Hide Details" : "Manage Order"}
                            </button>
                          </div>
                        </div>

                        {expandedOrderItem === item._id && (
                          <div className="order-management">
                            <div className="tracking-history">
                              <h5>Tracking History</h5>
                              <div className="tracking-timeline">
                                {item.trackingHistory && [...item.trackingHistory].reverse().map((tracking, index) => (
                                  <div key={index} className="tracking-event">
                                    <div className="tracking-dot"></div>
                                    <div className="tracking-info">
                                      <p className="tracking-status">{tracking.status}</p>
                                      <p className="tracking-description">{tracking.description}</p>
                                      {tracking.location && <p className="tracking-location"><MapPin size={14} className="inline-icon" /> {tracking.location}</p>}
                                      <p className="tracking-date">{new Date(tracking.timestamp).toLocaleString()}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="status-update-actions">
                              <h5>Quick Actions</h5>
                              <div className="quick-action-buttons">
                                <button
                                  className="action-btn approve-btn"
                                  onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, selectedOrder.itemId, "Processing", "", "Order approved and processing")}
                                >
                                  Approve
                                </button>
                                <button
                                  className="action-btn reject-btn"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to reject this order?")) {
                                      handleUpdateOrderStatus(selectedOrder.orderId, selectedOrder.itemId, "Cancelled", "", "Order rejected by vendor")
                                    }
                                  }}
                                >
                                  Reject
                                </button>
                                <button
                                  className="action-btn complete-btn"
                                  onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, selectedOrder.itemId, "Delivered", "", "Order delivered successfully")}
                                >
                                  Complete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VendorDashboard
