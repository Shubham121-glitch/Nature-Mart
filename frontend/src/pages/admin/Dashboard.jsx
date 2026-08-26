import { useState, useEffect } from "react"
import { Users, Package, ShoppingCart, Store, IndianRupee } from "lucide-react"
import api from "../../api"
import "./Dashboard.css"

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/admin/dashboard")
        setStats(res.data)
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner large"></div>
      </div>
    )
  }

  if (!stats) {
    return <div className="admin-error">Failed to load dashboard data</div>
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "blue" },
    { label: "Total Vendors", value: stats.totalVendors, icon: Store, color: "purple" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "green" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "orange" },
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "emerald" },
  ]

  const statusConfig = {
    Pending: { color: "warning" },
    Processing: { color: "info" },
    Shipped: { color: "primary" },
    "Out for Delivery": { color: "info" },
    Delivered: { color: "success" },
    Cancelled: { color: "danger" },
  }

  return (
    <div className="admin-dashboard animate-fadeIn">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Overview of your platform</p>
      </div>

      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className={`admin-stat-card stat-${card.color}`}>
            <div className="admin-stat-icon">
              <card.icon size={24} />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">{card.value}</span>
              <span className="admin-stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-orders-overview glass-card">
          <h3>Orders by Status</h3>
          <div className="admin-status-bars">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => {
              const config = statusConfig[status] || { color: "secondary" }
              const maxCount = Math.max(...Object.values(stats.ordersByStatus), 1)
              return (
                <div key={status} className="admin-status-bar-row">
                  <div className="admin-status-bar-label">
                    <span className={`admin-status-badge status-${config.color}`}>{status}</span>
                    <span className="admin-status-count">{count}</span>
                  </div>
                  <div className="admin-status-bar-track">
                    <div
                      className={`admin-status-bar-fill bar-${config.color}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="admin-recent-orders glass-card">
          <h3>Recent Orders</h3>
          <div className="admin-recent-orders-list">
            {stats.recentOrders.length === 0 ? (
              <p className="admin-empty-state">No orders yet</p>
            ) : (
              stats.recentOrders.map((order) => {
                const itemStatuses = order.items.map(i => i.status)
                const overallStatus = itemStatuses.includes("Cancelled") && itemStatuses.every(s => s === "Cancelled")
                  ? "Cancelled"
                  : itemStatuses.includes("Delivered")
                    ? "Delivered"
                    : order.items[0]?.status || "Pending"

                return (
                  <div key={order._id} className="admin-recent-order-item">
                    <div className="admin-order-info">
                      <span className="admin-order-id">#{order._id.slice(-6).toUpperCase()}</span>
                      <span className="admin-order-customer">{order.user?.username || "Unknown"}</span>
                    </div>
                    <div className="admin-order-meta">
                      <span className="admin-order-amount">₹{order.totalAmount.toLocaleString()}</span>
                      <span className={`admin-status-dot dot-${statusConfig[overallStatus]?.color || "secondary"}`}></span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
