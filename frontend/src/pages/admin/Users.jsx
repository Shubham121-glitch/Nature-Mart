import { useState, useEffect } from "react"
import { Search, Shield, ShieldOff, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "react-toastify"
import api from "../../api"
import "./Users.css"

const Users = () => {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page, limit: 10 })
        if (search) params.append("search", search)
        if (roleFilter) params.append("role", roleFilter)

        const res = await api.get(`/api/admin/users?${params}`)
        setUsers(res.data.users)
        setTotalPages(res.data.totalPages)
      } catch {
        toast.error("Failed to fetch users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page, search, roleFilter])

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole })
      toast.success("Role updated successfully")
      setPage(p => p)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role")
    }
  }

  const handleBan = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/ban`)
      toast.success("User banned successfully")
      setPage(p => p)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to ban user")
    }
  }

  const handleUnban = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/unban`)
      toast.success("User unbanned successfully")
      setPage(p => p)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unban user")
    }
  }

  return (
    <div className="admin-users-page animate-fadeIn">
      <div className="admin-page-header">
        <h1>Users</h1>
        <p>Manage all registered users</p>
      </div>

      <div className="admin-filters">
        <div className="admin-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="vendor">Vendors</option>
        </select>
      </div>

      <div className="admin-table-wrapper glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="admin-table-loading"><div className="loading-spinner"></div></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="admin-table-empty">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className={u.isBanned ? "banned-row" : ""}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-cell-avatar">{u.username[0].toUpperCase()}</div>
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`admin-role-badge role-${u.accountType}`}>{u.accountType}</span>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${u.isBanned ? "status-danger" : "status-success"}`}>
                      {u.isBanned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {u.accountType !== "admin" && (
                        <>
                          <button
                            className="admin-action-btn"
                            onClick={() => handleRoleChange(u._id, u.accountType === "user" ? "vendor" : "user")}
                            title={u.accountType === "user" ? "Make Vendor" : "Make User"}
                          >
                            {u.accountType === "user" ? <UserCheck size={16} /> : <UserX size={16} />}
                          </button>
                          {u.isBanned ? (
                            <button className="admin-action-btn success" onClick={() => handleUnban(u._id)} title="Unban">
                              <Shield size={16} />
                            </button>
                          ) : (
                            <button className="admin-action-btn danger" onClick={() => handleBan(u._id)} title="Ban">
                              <ShieldOff size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
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
    </div>
  )
}

export default Users
