import { useState, useEffect } from "react"
import { Search, Eye, X, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "react-toastify"
import api from "../../api"
import "./Orders.css"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetail, setOrderDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page, limit: 10 })
        if (search) params.append("search", search)
        if (statusFilter) params.append("status", statusFilter)

        const res = await api.get(`/api/admin/orders?${params}`)
        setOrders(res.data.orders)
        setTotalPages(res.data.totalPages)
      } catch {
        toast.error("Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [page, search, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const viewOrderDetail = async (orderId) => {
    setSelectedOrder(orderId)
    setLoadingDetail(true)
    try {
      const res = await api.get(`/api/admin/orders/${orderId}`)
      setOrderDetail(res.data.order)
    } catch {
      toast.error("Failed to load order details")
    } finally {
      setLoadingDetail(false)
    }
  }

  const statusColors = {
    Pending: "warning",
    Processing: "info",
    Shipped: "primary",
    "Out for Delivery": "info",
    Delivered: "success",
    Cancelled: "danger",
  }

  return (
    <div className="admin-orders-page animate-fadeIn">
      <div className="admin-page-header">
        <h1>Orders</h1>
        <p>Monitor all orders across the platform</p>
      </div>

      <div className="admin-filters">
        <div className="admin-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="admin-table-wrapper glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="admin-table-loading"><div className="loading-spinner"></div></td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="7" className="admin-table-empty">No orders found</td></tr>
            ) : (
              orders.map((order) => {
                const itemStatuses = order.items.map(i => i.status)
                const overallStatus = itemStatuses.includes("Cancelled") && itemStatuses.every(s => s === "Cancelled")
                  ? "Cancelled"
                  : itemStatuses.includes("Delivered")
                    ? "Delivered"
                    : order.items[0]?.status || "Pending"

                return (
                  <tr key={order._id}>
                    <td className="admin-order-id-cell">#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.user?.username || "Unknown"}</td>
                    <td>{order.items.length}</td>
                    <td className="admin-order-amount-cell">₹{order.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className={`admin-status-badge status-${statusColors[overallStatus]}`}>
                        {overallStatus}
                      </span>
                    </td>
                    <td className="admin-order-date-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <button className="admin-action-btn" onClick={() => viewOrderDetail(order._id)} title="View Details">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => { setSelectedOrder(null); setOrderDetail(null); }}>
          <div className="admin-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Order Details</h3>
              <button className="admin-modal-close" onClick={() => { setSelectedOrder(null); setOrderDetail(null); }}>
                <X size={20} />
              </button>
            </div>
            {loadingDetail ? (
              <div className="admin-modal-loading">
                <div className="loading-spinner"></div>
              </div>
            ) : orderDetail ? (
              <div className="admin-order-detail">
                <div className="admin-order-detail-grid">
                  <div className="admin-detail-section">
                    <h4>Order Info</h4>
                    <p><strong>ID:</strong> #{orderDetail._id.slice(-8).toUpperCase()}</p>
                    <p><strong>Date:</strong> {new Date(orderDetail.createdAt).toLocaleString("en-IN")}</p>
                    <p><strong>Total:</strong> ₹{orderDetail.totalAmount.toLocaleString()}</p>
                    <p><strong>Payment:</strong> {orderDetail.paymentMethod} ({orderDetail.paymentStatus})</p>
                  </div>
                  <div className="admin-detail-section">
                    <h4>Customer</h4>
                    <p><strong>Name:</strong> {orderDetail.user?.username}</p>
                    <p><strong>Email:</strong> {orderDetail.user?.email}</p>
                  </div>
                  <div className="admin-detail-section">
                    <h4>Shipping Address</h4>
                    <p>{orderDetail.shippingAddress?.district}, {orderDetail.shippingAddress?.state}</p>
                    <p>{orderDetail.shippingAddress?.tehsil} - {orderDetail.shippingAddress?.pin}</p>
                    <p>Contact: {orderDetail.shippingAddress?.contactNumber}</p>
                  </div>
                </div>

                <h4 className="admin-items-title">Items ({orderDetail.items.length})</h4>
                <div className="admin-order-items-list">
                  {orderDetail.items.map((item, idx) => (
                    <div key={idx} className="admin-order-item">
                      <div className="admin-item-info">
                        <span className="admin-item-name">{item.product?.name || "Product"}</span>
                        <span className="admin-item-vendor">by {item.vendor?.username || "Vendor"}</span>
                      </div>
                      <div className="admin-item-meta">
                        <span>Qty: {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                        <span className={`admin-status-badge status-${statusColors[item.status]}`}>{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
