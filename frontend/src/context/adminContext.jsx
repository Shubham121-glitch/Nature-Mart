import { createContext, useState, useContext, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"

const adminContext = createContext()

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("hortx-admin-dark-mode")
    return saved === "true"
  })
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light")
    localStorage.setItem("hortx-admin-dark-mode", darkMode)
  }, [darkMode])

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout")
    } catch {
      // ignore
    } finally {
      setAdmin(null)
      localStorage.removeItem("accessToken")
      navigate("/admin/login")
    }
  }, [navigate])

  useEffect(() => {
    const initAdmin = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setLoading(false)
        navigate("/admin/login")
        return
      }

      try {
        const res = await api.get("/api/auth/get-user")
        if (res.data.user.accountType !== "admin") {
          setAdmin(null)
          localStorage.removeItem("accessToken")
          navigate("/admin/login")
          return
        }
        setAdmin(res.data.user)
      } catch (err) {
        if (err.response?.status === 401) {
          try {
            await api.get("/api/auth/refresh-token")
            const retryRes = await api.get("/api/auth/get-user")
            if (retryRes.data.user.accountType !== "admin") {
              setAdmin(null)
              localStorage.removeItem("accessToken")
              navigate("/admin/login")
              return
            }
            setAdmin(retryRes.data.user)
          } catch {
            setAdmin(null)
            localStorage.removeItem("accessToken")
            navigate("/admin/login")
          }
        } else {
          setAdmin(null)
          navigate("/admin/login")
        }
      } finally {
        setLoading(false)
      }
    }

    initAdmin()
  }, [navigate])

  const value = {
    admin,
    setAdmin,
    loading,
    darkMode,
    setDarkMode,
    logout
  }

  return <adminContext.Provider value={value}>{children}</adminContext.Provider>
}

export const useAdmin = () => useContext(adminContext)
