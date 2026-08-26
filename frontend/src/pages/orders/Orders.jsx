import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api"
import { toast } from "react-toastify"
import { useUser } from "../../context/userContext"
import {
  Package, Truck, ArrowRight, Box, CheckCircle,
  Clock, XCircle, MapPin
} from "lucide-react"
import "./Orders.css"

const Orders = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders/user")
      setOrders(res.data.orders)
    } catch {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login")
    } else {
      fetchOrders()
    }
  }, [user, navigate])

  const getStatusIcon = (status) => {
    if (!status) return <Package size={20} className="status-icon pending" />
    switch (status) {
      case "Pending": return <Clock size={20} className="status-icon pending" />
      case "Processing": return <Box size={20} className="status-icon processing" />
      case "Shipped": return <Truck size={20} className="status-icon shipped" />
      case "Delivered": return <CheckCircle size={20} className="status-icon delivered" />
      case "Cancelled": return <XCircle size={20} className="status-icon cancelled" />
      default: return <Package size={20} className="status-icon" />
    }
  }

  const getStatusClass = (status) => {
    if (!status) return "status-badge status-pending"
    return `status-badge status-${status.toLowerCase().replace(/ /g, '-')}`
  }

  const getOverallStatus = (items) => {
    if (!items || items.length === 0) return "Pending"
    const statuses = items.map(i => i.status)
    if (statuses.includes("Pending")) return "Pending"
    if (statuses.includes("Processing")) return "Processing"
    if (statuses.includes("Shipped")) return "Shipped"
    if (statuses.includes("Out for Delivery")) return "Out for Delivery"
    if (statuses.every(s => s === "Delivered")) return "Delivered"
    if (statuses.every(s => s === "Cancelled")) return "Cancelled"
    return statuses[0] || "Pending"
  }

  if (loading) return (
    <div className="page-loading">
      <div className="loading-spinner large"></div>
    </div>
  )

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1 className="page-title">
          <Package className="title-icon" />
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon-wrapper">
              <Package size={60} />
            </div>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders yet. Start exploring our natural products!</p>
            <button className="shop-now-btn" onClick={() => navigate("/")}>
              <span>Start Shopping</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-meta">
                    <div className="order-id-group">
                      <span className="order-label">Order ID</span>
                      <span className="order-id">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                    </div>
                    <div className="order-date-group">
                      <span className="order-label">Placed On</span>
                      <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  <div className="order-status-group">
                    {getStatusIcon(getOverallStatus(order.items))}
                    <span className={getStatusClass(getOverallStatus(order.items))}>{getOverallStatus(order.items)}</span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <img
                        src={`${api.defaults.baseURL}${item.product.images[0]}`}
                        alt={item.product.name}
                        onClick={() => navigate(`/product/${item.product._id}`)}
                      />
                      <div className="item-details">
                        <h4 onClick={() => navigate(`/product/${item.product._id}`)}>
                          {item.product.name}
                        </h4>
                        <p className="item-vendor">Sold by: {item.vendor.username}</p>
                        <div className="item-price-qty">
                          <span className="qty">Qty: {item.quantity}</span>
                          <span className={getStatusClass(item.status)} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                            {item.status}
                          </span>
                          <span className="price">&#8377;{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="shipping-info">
                    <MapPin size={16} />
                    <p>{order.shippingAddress?.state}, {order.shippingAddress?.district}, {order.shippingAddress?.tehsil}, {order.shippingAddress?.pin}</p>
                  </div>
                  <div className="order-total-group">
                    <span className="total-label">Total Amount</span>
                    <span className="total-amount">&#8377;{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {order.tracking && order.tracking.length > 0 && (
                  <div className="order-tracking">
                    <h4>Tracking History</h4>
                    <div className="tracking-timeline">
                      {order.tracking.map((track, idx) => (
                        <div key={idx} className="tracking-event">
                          <div className="tracking-dot"></div>
                          <div className="tracking-content">
                            <p className="track-status">{track.status}</p>
                            <p className="track-desc">{track.description}</p>
                            {track.location && (
                              <p className="track-loc">
                                <MapPin size={12} /> {track.location}
                              </p>
                            )}
                            <p className="track-time">
                              {new Date(track.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
