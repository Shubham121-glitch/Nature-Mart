import { useState, useEffect } from "react"
import { Search, Package, ShoppingCart, IndianRupee, ChevronLeft, ChevronRight, ShieldOff, Shield } from "lucide-react"
import { toast } from "react-toastify"
import api from "../../api"
import "./Vendors.css"

const Vendors = () => {
  const [vendors, setVendors] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page, limit: 10 })
        if (search) params.append("search", search)

        const res = await api.get(`/api/admin/vendors?${params}`)
        setVendors(res.data.vendors)
        setTotalPages(res.data.totalPages)
      } catch {
        toast.error("Failed to fetch vendors")
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [page, search])

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleBan = async (vendorId) => {
    try {
      await api.put(`/api/admin/users/${vendorId}/ban`)
      toast.success("Vendor banned successfully")
      setPage(p => p)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to ban vendor")
    }
  }

  const handleUnban = async (vendorId) => {
    try {
      await api.put(`/api/admin/users/${vendorId}/unban`)
      toast.success("Vendor unbanned successfully")
      setPage(p => p)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unban vendor")
    }
  }

  return (
    <div className="admin-vendors-page animate-fadeIn">
      <div className="admin-page-header">
        <h1>Vendors</h1>
        <p>Manage all vendors on the platform</p>
      </div>

      <div className="admin-filters">
        <div className="admin-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-vendors-grid">
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner large"></div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="admin-empty-grid">No vendors found</div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor._id} className={`admin-vendor-card glass-card ${vendor.isBanned ? "vendor-banned" : ""}`}>
              <div className="admin-vendor-header">
                <div className="admin-vendor-avatar">
                  {vendor.username[0].toUpperCase()}
                </div>
                <div className="admin-vendor-identity">
                  <h4>{vendor.username}</h4>
                  <p>{vendor.email}</p>
                </div>
                {vendor.isBanned && (
                  <span className="admin-status-badge status-danger">Banned</span>
                )}
              </div>

              <div className="admin-vendor-stats">
                <div className="admin-vendor-stat">
                  <Package size={16} />
                  <span className="stat-value">{vendor.productCount}</span>
                  <span className="stat-label">Products</span>
                </div>
                <div className="admin-vendor-stat">
                  <ShoppingCart size={16} />
                  <span className="stat-value">{vendor.totalOrders}</span>
                  <span className="stat-label">Orders</span>
                </div>
                <div className="admin-vendor-stat">
                  <IndianRupee size={16} />
                  <span className="stat-value">₹{vendor.totalRevenue.toLocaleString()}</span>
                  <span className="stat-label">Revenue</span>
                </div>
              </div>

              <div className="admin-vendor-actions">
                {vendor.isBanned ? (
                  <button className="admin-btn admin-btn-outline success" onClick={() => handleUnban(vendor._id)}>
                    <Shield size={16} />
                    Unban Vendor
                  </button>
                ) : (
                  <button className="admin-btn admin-btn-outline danger" onClick={() => handleBan(vendor._id)}>
                    <ShieldOff size={16} />
                    Ban Vendor
                  </button>
                )}
              </div>
            </div>
          ))
        )}
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
    </div>
  )
}

export default Vendors
