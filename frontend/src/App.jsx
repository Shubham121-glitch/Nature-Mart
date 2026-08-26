import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Navbar from './components/Navbar'
import VendorDashboard from './pages/vendor/VendorDashboard'
import Shop from './pages/shop/Shop'
import Cart from './pages/cart/Cart'
import Orders from './pages/orders/Orders'
import Wishlist from './pages/wishlist/Wishlist'
import Notifications from './pages/notifications/Notifications'
import ProductDetail from './pages/product/ProductDetail'
import UserDashboard from './pages/dashboard/Dashboard'
import { UserProvider, useUser } from './context/userContext'
import { AdminProvider } from './context/adminContext'
import AdminLayout from './components/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminVendors from './pages/admin/Vendors'
import AdminAnalytics from './pages/admin/Analytics'
import ChatbotWidget from './components/ChatbotWidget'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser()
  
  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner large"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

const AdminRoutes = () => {
  return (
    <AdminProvider>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="vendors" element={<AdminVendors />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminProvider>
  )
}

const MainRoutes = () => {
  return (
    <UserProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/vendor-dashboard" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatbotWidget />
      </div>
    </UserProvider>
  )
}

const App = () => {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*" element={<MainRoutes />} />
    </Routes>
  )
}

export default App
