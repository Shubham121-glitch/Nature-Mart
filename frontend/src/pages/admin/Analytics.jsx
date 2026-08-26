import { useState, useEffect } from "react"
import { TrendingUp, IndianRupee, ShoppingCart, Package, Users, Store, BarChart3, PieChart, Calendar } from "lucide-react"
import { toast } from "react-toastify"
import api from "../../api"
import "./Analytics.css"

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/api/admin/analytics?period=${period}`)
        setData(res.data)
      } catch (err) {
        console.error("Analytics fetch error:", err)
        setError(err.response?.data?.message || "Failed to fetch analytics")
        toast.error(err.response?.data?.message || "Failed to fetch analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner large"></div>
      </div>
    )
  }

  if (!data) {
    return <div className="admin-error">{error || "Failed to load analytics data"}</div>
  }

  const { summary, revenueChart, ordersChart, categoryDistribution, paymentMethods, topProducts, topVendors, userGrowthChart } = data

  const maxRevenue = Math.max(...revenueChart.map(d => d.revenue), 1)
  const maxOrders = Math.max(...ordersChart.map(d => d.orders), 1)
  const maxUsers = Math.max(...userGrowthChart.map(d => d.users + d.vendors), 1)

  const totalCategoryCount = categoryDistribution.reduce((sum, c) => sum + c.count, 0)
  const totalPayments = paymentMethods.reduce((sum, p) => sum + p.count, 0)

  const paymentColors = { COD: "#f59e0b", UPI: "#8b5cf6", Card: "#3b82f6" }

  return (
    <div className="admin-analytics animate-fadeIn">
      <div className="admin-page-header">
        <div>
          <h1>Analytics</h1>
          <p>Platform performance and insights</p>
        </div>
        <div className="admin-period-filter">
          <button className={`period-btn ${period === "7d" ? "active" : ""}`} onClick={() => setPeriod("7d")}>7D</button>
          <button className={`period-btn ${period === "30d" ? "active" : ""}`} onClick={() => setPeriod("30d")}>30D</button>
          <button className={`period-btn ${period === "90d" ? "active" : ""}`} onClick={() => setPeriod("90d")}>90D</button>
        </div>
      </div>

      <div className="analytics-summary-row">
        <div className="analytics-kpi-card">
          <div className="kpi-icon revenue"><IndianRupee size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-value">₹{summary.totalRevenue.toLocaleString()}</span>
            <span className="kpi-label">Total Revenue</span>
          </div>
        </div>
        <div className="analytics-kpi-card">
          <div className="kpi-icon orders"><ShoppingCart size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-value">{summary.totalOrders}</span>
            <span className="kpi-label">Total Orders</span>
          </div>
        </div>
        <div className="analytics-kpi-card">
          <div className="kpi-icon aov"><TrendingUp size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-value">₹{summary.avgOrderValue.toLocaleString()}</span>
            <span className="kpi-label">Avg Order Value</span>
          </div>
        </div>
        <div className="analytics-kpi-card">
          <div className="kpi-icon completion"><Package size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-value">{summary.completionRate}%</span>
            <span className="kpi-label">Completion Rate</span>
          </div>
        </div>
      </div>

      <div className="analytics-charts-row">
        <div className="analytics-chart-card glass-card">
          <div className="chart-header">
            <h3><IndianRupee size={16} /> Revenue Trend</h3>
          </div>
          <div className="bar-chart">
            {revenueChart.length === 0 ? (
              <div className="chart-empty">No data for this period</div>
            ) : (
              revenueChart.map((d, i) => (
                <div key={i} className="bar-chart-col">
                  <div className="bar-tooltip">₹{d.revenue.toLocaleString()}</div>
                  <div
                    className="bar-fill revenue-bar"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="bar-label">{d.date.slice(5)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="analytics-chart-card glass-card">
          <div className="chart-header">
            <h3><BarChart3 size={16} /> Orders Trend</h3>
          </div>
          <div className="bar-chart">
            {ordersChart.length === 0 ? (
              <div className="chart-empty">No data for this period</div>
            ) : (
              ordersChart.map((d, i) => (
                <div key={i} className="bar-chart-col">
                  <div className="bar-tooltip">{d.orders}</div>
                  <div
                    className="bar-fill orders-bar"
                    style={{ height: `${(d.orders / maxOrders) * 100}%` }}
                  />
                  <span className="bar-label">{d.date.slice(5)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="analytics-charts-row three-col">
        <div className="analytics-chart-card glass-card">
          <div className="chart-header">
            <h3><Users size={16} /> User Growth</h3>
          </div>
          <div className="stacked-bar-chart">
            {userGrowthChart.length === 0 ? (
              <div className="chart-empty">No data</div>
            ) : (
              userGrowthChart.map((d, i) => (
                <div key={i} className="stacked-col">
                  <div className="stacked-tooltip">{d.users}U / {d.vendors}V</div>
                  <div className="stacked-bars">
                    <div
                      className="stacked-fill users-fill"
                      style={{ height: `${((d.users) / maxUsers) * 100}%` }}
                    />
                    <div
                      className="stacked-fill vendors-fill"
                      style={{ height: `${((d.vendors) / maxUsers) * 100}%` }}
                    />
                  </div>
                  <span className="bar-label">{d.date.slice(5)}</span>
                </div>
              ))
            )}
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot users-dot"></span>Users</span>
            <span className="legend-item"><span className="legend-dot vendors-dot"></span>Vendors</span>
          </div>
        </div>

        <div className="analytics-chart-card glass-card">
          <div className="chart-header">
            <h3><PieChart size={16} /> Categories</h3>
          </div>
          <div className="donut-chart-wrapper">
            <svg viewBox="0 0 120 120" className="donut-chart">
              {categoryDistribution.length === 0 ? (
                <text x="60" y="60" textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">No data</text>
              ) : (
                categoryDistribution.reduce((acc, cat, i) => {
                  const pct = (cat.count / totalCategoryCount) * 100
                  const offset = acc.offset
                  const colors = ["#16a34a", "#14b8a6", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"]
                  acc.elements.push(
                    <circle
                      key={i}
                      cx="60" cy="60" r="45"
                      fill="none"
                      stroke={colors[i % colors.length]}
                      strokeWidth="24"
                      strokeDasharray={`${(pct / 100) * 283} ${283 - (pct / 100) * 283}`}
                      strokeDashoffset={`${-offset * 283 / 100}`}
                      className="donut-segment"
                    />
                  )
                  acc.offset += pct
                  return acc
                }, { elements: [], offset: 0 }).elements
              )}
              <text x="60" y="57" textAnchor="middle" className="donut-center-value">{totalCategoryCount}</text>
              <text x="60" y="70" textAnchor="middle" className="donut-center-label">Products</text>
            </svg>
            <div className="donut-legend">
              {categoryDistribution.slice(0, 5).map((cat, i) => {
                const colors = ["#16a34a", "#14b8a6", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"]
                return (
                  <span key={i} className="donut-legend-item">
                    <span className="legend-color" style={{ background: colors[i % colors.length] }}></span>
                    {cat.name} ({cat.count})
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <div className="analytics-chart-card glass-card">
          <div className="chart-header">
            <h3><Calendar size={16} /> Payment Methods</h3>
          </div>
          <div className="payment-breakdown">
            {paymentMethods.map((pm, i) => {
              const pct = totalPayments > 0 ? ((pm.count / totalPayments) * 100).toFixed(1) : 0
              return (
                <div key={i} className="payment-item">
                  <div className="payment-info">
                    <span className="payment-name">{pm.name}</span>
                    <span className="payment-count">{pm.count} orders</span>
                  </div>
                  <div className="payment-bar-track">
                    <div
                      className="payment-bar-fill"
                      style={{ width: `${pct}%`, background: paymentColors[pm.name] || "#64748b" }}
                    />
                  </div>
                  <span className="payment-pct">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="analytics-charts-row two-col">
        <div className="analytics-chart-card glass-card">
          <div className="chart-header">
            <h3><TrendingUp size={16} /> Top Products by Revenue</h3>
          </div>
          <div className="top-list">
            {topProducts.length === 0 ? (
              <div className="chart-empty">No data</div>
            ) : (
              topProducts.map((p, i) => (
                <div key={i} className="top-list-item">
                  <span className="top-rank">#{i + 1}</span>
                  <div className="top-info">
                    <span className="top-name">{p.name}</span>
                    <span className="top-meta">{p.count} units sold</span>
                  </div>
                  <span className="top-value">₹{p.revenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="analytics-chart-card glass-card">
          <div className="chart-header">
            <h3><Store size={16} /> Top Vendors by Revenue</h3>
          </div>
          <div className="top-list">
            {topVendors.length === 0 ? (
              <div className="chart-empty">No data</div>
            ) : (
              topVendors.map((v, i) => (
                <div key={i} className="top-list-item">
                  <span className="top-rank">#{i + 1}</span>
                  <div className="top-info">
                    <span className="top-name">{v.name}</span>
                  </div>
                  <span className="top-value">₹{v.revenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="analytics-stats-row">
        <div className="mini-stat">
          <span className="mini-stat-label">Items Sold</span>
          <span className="mini-stat-value">{summary.totalItemsSold}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Products Listed</span>
          <span className="mini-stat-value">{summary.totalProducts}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Active Users</span>
          <span className="mini-stat-value">{summary.totalUsers}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Vendors</span>
          <span className="mini-stat-value">{summary.totalVendors}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Cancelled Orders</span>
          <span className="mini-stat-value cancelled">{summary.cancelledOrders}</span>
        </div>
      </div>
    </div>
  )
}

export default Analytics
