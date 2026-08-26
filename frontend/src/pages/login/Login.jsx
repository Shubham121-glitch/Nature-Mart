import { useState, useEffect } from 'react'
import './login.css'
import api from '../../api'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/userContext'
import { Mail, Lock, Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react'

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const navigate = useNavigate()
  const { user, setUser, fetchUserData } = useUser()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/login', data)
      localStorage.setItem('accessToken', res.data.accessToken)
      setUser(res.data.user)
      await fetchUserData()
      toast.success(res.data.message || 'Welcome back!')
      navigate('/')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(errorMsg)
    }
  }

  return (
    <div className="login-page">
      <div className="organic-shapes">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="floating-leaf leaf-1">🌿</div>
        <div className="floating-leaf leaf-2">🍃</div>
        <div className="floating-leaf leaf-3">🌱</div>
        <div className="floating-leaf leaf-4">🍀</div>
        <div className="floating-leaf leaf-5">🌿</div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon">
              <Leaf size={28} />
            </div>
            <span className="login-logo-text">Nature Mart</span>
          </div>
          <h1>Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="input-group">
            <div className="input-wrapper">
              <div className="input-icon">
                <Mail size={18} />
              </div>
              <input
                type="email"
                id="login-email"
                placeholder="Email address"
                className={errors.email ? 'error' : ''}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                placeholder="Password"
                className={errors.password ? 'error' : ''}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <div className="login-options">
            <label className="remember-me" id="remember-me-label">
              <input type="checkbox" id="remember-me" />
              <span className="checkmark"></span>
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <div className="btn-loading">
                <div className="loading-spinner small"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Login
