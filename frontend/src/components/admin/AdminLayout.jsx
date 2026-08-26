import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, Package, ShoppingCart, Store, BarChart3, LogOut, Sun, Moon, Menu, X, Shield, ChevronLeft } from "lucide-react"
import { useAdmin } from "../../context/adminContext"
import "./adminLayout.css"

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { admin, darkMode, setDarkMode, logout } = useAdmin()
  const navigate = useNavigate()

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/admin/vendors", icon: Store, label: "Vendors" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/admin/login")
  }

  return (
    <div className={`admin-layout ${collapsed ? "collapsed" : ""}`}>
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <div className="admin-brand-icon">
              <Shield size={22} />
            </div>
            {!collapsed && <span className="admin-brand-text">Nature Mart Admin</span>}
          </div>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item admin-logout-btn" onClick={handleLogout} title={collapsed ? "Logout" : undefined}>
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <button className="admin-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              <ChevronLeft size={18} className={`collapse-icon ${collapsed ? "rotated" : ""}`} />
            </button>
          </div>
          <div className="admin-topbar-right">
            <button className="admin-theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="admin-user-info">
              <div className="admin-user-avatar">
                {admin?.username?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="admin-user-details">
                <span className="admin-user-name">{admin?.username}</span>
                <span className="admin-user-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
