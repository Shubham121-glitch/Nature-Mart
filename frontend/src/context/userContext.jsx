import { createContext, useState, useContext, useEffect, useCallback } from "react"
import api from "../api"

const userContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(null)
  const [wishlist, setWishlist] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("hortx-dark-mode")
    return saved === "true"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light")
    localStorage.setItem("hortx-dark-mode", darkMode)
  }, [darkMode])

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout")
    } catch {
      // ignore logout errors
    } finally {
      setUser(null)
      setCart(null)
      setWishlist(null)
      setNotifications([])
      localStorage.removeItem("accessToken")
    }
  }, [])

  const fetchUserData = useCallback(async () => {
    try {
      const [userRes, cartRes, wishlistRes, notificationsRes] = await Promise.all([
        api.get("/api/auth/get-user"),
        api.get("/api/cart"),
        api.get("/api/wishlist"),
        api.get("/api/notifications")
      ])

      setUser(userRes.data.user)
      setCart(cartRes.data.cart)
      setWishlist(wishlistRes.data.wishlist)
      setNotifications(notificationsRes.data.notifications)
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [fetchUserData])

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    cart,
    setCart,
    wishlist,
    setWishlist,
    notifications,
    setNotifications,
    darkMode,
    setDarkMode,
    fetchUserData,
    logout
  }

  return <userContext.Provider value={value}>{children}</userContext.Provider>
}

export const useUser = () => useContext(userContext)
export default userContext
