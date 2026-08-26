import { useState, useEffect } from "react"
import { User, Mail, MapPin, Phone, Lock, Save, CheckCircle, ArrowLeft, Store, Sparkles, LayoutDashboard } from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import api from "../../api"
import { useUser } from "../../context/userContext"
import "./Dashboard.css"

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry"
]

const UserDashboard = () => {
  const { user, fetchUserData } = useUser()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    address: {
      state: "",
      district: "",
      tehsil: "",
      pin: "",
      contactNumber: ""
    }
  })

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [becomingVendor, setBecomingVendor] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || "",
        email: user.email || "",
        address: {
          state: user.address?.state || "",
          district: user.address?.district || "",
          tehsil: user.address?.tehsil || "",
          pin: user.address?.pin || "",
          contactNumber: user.address?.contactNumber || ""
        }
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("address.")) {
      const field = name.split(".")[1]
      setProfile(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    } else {
      setProfile(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api.put("/api/auth/update-profile", profile)
      toast.success("Profile updated successfully!")
      await fetchUserData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = (e) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    setSavingPassword(true)
    try {
      await api.put("/api/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      toast.success("Password changed successfully!")
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleBecomeVendor = async () => {
    setBecomingVendor(true)
    try {
      const res = await api.post("/api/auth/become-vendor")
      toast.success(res.data.message)
      await fetchUserData()
      navigate("/vendor-dashboard")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to become vendor")
    } finally {
      setBecomingVendor(false)
    }
  }

  if (!user) return null

  const isVendor = user.accountType === "vendor"
  const isAdmin = user.accountType === "admin"

  return (
    <div className="user-dashboard page-container animate-fadeIn">
      <div className="dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>My Dashboard</h1>
          <p>Manage your account settings</p>
        </div>
      </div>

      {!isVendor && !isAdmin && (
        <div className="vendor-cta glass-card animate-fadeIn">
          <div className="vendor-cta-content">
            <div className="vendor-cta-icon">
              <Store size={28} />
            </div>
            <div className="vendor-cta-text">
              <h3>Become a Vendor</h3>
              <p>Start selling your products to thousands of customers. List products, manage orders, and grow your business.</p>
            </div>
          </div>
          <button
            className="vendor-cta-btn"
            onClick={handleBecomeVendor}
            disabled={becomingVendor}
          >
            {becomingVendor ? (
              <div className="btn-spinner"></div>
            ) : (
              <>
                <Sparkles size={16} />
                Start Selling
              </>
            )}
          </button>
        </div>
      )}

      {isVendor && (
        <div className="vendor-status glass-card animate-fadeIn">
          <div className="vendor-status-content">
            <div className="vendor-status-icon">
              <Store size={22} />
            </div>
            <div>
              <h4>You are a Vendor</h4>
              <p>Access your vendor dashboard to manage products and orders.</p>
            </div>
          </div>
          <button className="vendor-dashboard-btn" onClick={() => navigate("/vendor-dashboard")}>
            <LayoutDashboard size={16} />
            Vendor Dashboard
          </button>
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={16} />
          Profile
        </button>
        <button
          className={`dashboard-tab ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          <Lock size={16} />
          Password
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="dashboard-card glass-card animate-fadeIn">
          <div className="card-header">
            <div className="card-icon"><User size={20} /></div>
            <div>
              <h3>Profile Information</h3>
              <p>Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="dashboard-form">
            <div className="form-section">
              <h4>Account</h4>
              <div className="form-row two-col">
                <div className="form-group">
                  <label><User size={14} /> Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><Mail size={14} /> Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4><MapPin size={16} /> Address</h4>
              <div className="form-row two-col">
                <div className="form-group">
                  <label>State / UT</label>
                  <select
                    name="address.state"
                    value={profile.address.state}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="">Select State</option>
                    {indianStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input
                    type="text"
                    name="address.district"
                    value={profile.address.district}
                    onChange={handleProfileChange}
                    placeholder="District"
                    required
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Tehsil / City</label>
                  <input
                    type="text"
                    name="address.tehsil"
                    value={profile.address.tehsil}
                    onChange={handleProfileChange}
                    placeholder="Tehsil"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>PIN Code</label>
                  <input
                    type="text"
                    name="address.pin"
                    value={profile.address.pin}
                    onChange={handleProfileChange}
                    placeholder="PIN"
                    maxLength="6"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Phone size={14} /> Contact Number</label>
                  <input
                    type="tel"
                    name="address.contactNumber"
                    value={profile.address.contactNumber}
                    onChange={handleProfileChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={savingProfile}>
                {savingProfile ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "password" && (
        <div className="dashboard-card glass-card animate-fadeIn">
          <div className="card-header">
            <div className="card-icon lock-icon"><Lock size={20} /></div>
            <div>
              <h3>Change Password</h3>
              <p>Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="dashboard-form">
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={savingPassword}>
                {savingPassword ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default UserDashboard
