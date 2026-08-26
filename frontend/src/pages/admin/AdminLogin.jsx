import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Mail, Lock, LogIn } from "lucide-react"
import { toast } from "react-toastify"
import api from "../../api"
import { useAdmin } from "../../context/adminContext"
import "./AdminLogin.css"

const AdminLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { setAdmin } = useAdmin()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post("/api/auth/login", { email, password })
      const { user, accessToken } = res.data

      if (user.accountType !== "admin") {
        toast.error("Access denied. Admin only.")
        setSubmitting(false)
        return
      }

      localStorage.setItem("accessToken", accessToken)
      setAdmin(user)
      toast.success("Welcome back, Admin!")
      navigate("/admin")
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="admin-login-blob blob-1"></div>
        <div className="admin-login-blob blob-2"></div>
      </div>
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <Shield size={32} />
          </div>
          <h1>Nature Mart Admin</h1>
          <p>Sign in to the admin panel</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-input-group">
            <Mail size={18} className="admin-input-icon" />
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="admin-input-group">
            <Lock size={18} className="admin-input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={submitting}>
            {submitting ? (
              <div className="admin-btn-spinner"></div>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
