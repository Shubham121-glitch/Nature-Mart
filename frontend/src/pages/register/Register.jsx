import React, { useState } from 'react'
import './register.css'
import api from '../../api'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/userContext'
import {
  User, Mail, Lock, Eye, EyeOff, MapPin, Phone,
  ArrowRight, ArrowLeft, Check, Leaf, Building, Hash
} from 'lucide-react'

const Register = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, trigger } = useForm({
    defaultValues: { accountType: 'user' }
  })
  const navigate = useNavigate()
  const { user, setUser, fetchUserData } = useUser()

  React.useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/register', data)
      localStorage.setItem('accessToken', res.data.accessToken)
      setUser(res.data.user)
      await fetchUserData()
      toast.success(res.data.message || 'Account created!')
      navigate('/')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(errorMsg)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate = []
    if (step === 1) fieldsToValidate = ['username', 'email', 'password', 'accountType']
    if (step === 2) fieldsToValidate = ['address.state', 'address.district', 'address.tehsil', 'address.pin', 'address.contactNumber']

    const isValid = await trigger(fieldsToValidate)
    if (isValid) setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const steps = [
    { num: 1, label: "Account" },
    { num: 2, label: "Address" },
    { num: 3, label: "Confirm" }
  ]

  return (
    <div className="register-page">
      <div className="organic-shapes">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="floating-leaf leaf-1">🌿</div>
        <div className="floating-leaf leaf-2">🍃</div>
        <div className="floating-leaf leaf-3">🌱</div>
        <div className="floating-leaf leaf-4">🍀</div>
      </div>

      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <div className="register-logo-icon">
              <Leaf size={28} />
            </div>
            <span className="register-logo-text">Nature Mart</span>
          </div>
          <h1>Create Account</h1>
          <p className="register-subtitle">Join our green marketplace</p>
        </div>

        <div className="progress-steps">
          {steps.map((s) => (
            <div key={s.num} className={`step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className="step-label">{s.label}</span>
              {s.num < steps.length && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div className={`form-step ${step === 1 ? 'active' : ''} ${step > 1 ? 'left' : ''}`}>
            <div className="input-group">
              <div className="input-wrapper">
                <div className="input-icon"><User size={18} /></div>
                <input
                  type="text"
                  id="reg-username"
                  placeholder="Username"
                  className={errors.username ? 'error' : ''}
                  {...register('username', { required: 'Username is required' })}
                />
              </div>
              {errors.username && <p className="error-text">{errors.username.message}</p>}
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <div className="input-icon"><Mail size={18} /></div>
                <input
                  type="email"
                  id="reg-email"
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
                <div className="input-icon"><Lock size={18} /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="reg-password"
                  placeholder="Password"
                  className={errors.password ? 'error' : ''}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
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

            <div className="input-group">
              <label className="select-label">Account Type</label>
              <div className="account-type-selector">
                <label className={`type-option ${watch('accountType') === 'user' ? 'selected' : ''}`}>
                  <input type="radio" value="user" {...register('accountType')} />
                  <User size={20} />
                  <span>Buyer</span>
                </label>
                <label className={`type-option ${watch('accountType') === 'vendor' ? 'selected' : ''}`}>
                  <input type="radio" value="vendor" {...register('accountType')} />
                  <Building size={20} />
                  <span>Vendor</span>
                </label>
              </div>
            </div>
          </div>

          <div className={`form-step ${step === 2 ? 'active' : ''} ${step > 2 ? 'left' : ''} ${step < 2 ? 'right' : ''}`}>
            <div className="input-row">
              <div className="input-group">
                <div className="input-wrapper">
                  <div className="input-icon"><MapPin size={18} /></div>
                  <input
                    type="text"
                    id="reg-state"
                    placeholder="State/UT"
                    className={errors.address?.state ? 'error' : ''}
                    {...register('address.state', { required: 'State is required' })}
                  />
                </div>
                {errors.address?.state && <p className="error-text">{errors.address.state.message}</p>}
              </div>
              <div className="input-group">
                <div className="input-wrapper">
                  <div className="input-icon"><Building size={18} /></div>
                  <input
                    type="text"
                    id="reg-district"
                    placeholder="District"
                    className={errors.address?.district ? 'error' : ''}
                    {...register('address.district', { required: 'District is required' })}
                  />
                </div>
                {errors.address?.district && <p className="error-text">{errors.address.district.message}</p>}
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <div className="input-wrapper">
                  <div className="input-icon"><MapPin size={18} /></div>
                  <input
                    type="text"
                    id="reg-tehsil"
                    placeholder="Tehsil"
                    className={errors.address?.tehsil ? 'error' : ''}
                    {...register('address.tehsil', { required: 'Tehsil is required' })}
                  />
                </div>
                {errors.address?.tehsil && <p className="error-text">{errors.address.tehsil.message}</p>}
              </div>
              <div className="input-group">
                <div className="input-wrapper">
                  <div className="input-icon"><Hash size={18} /></div>
                  <input
                    type="text"
                    id="reg-pin"
                    placeholder="PIN Code"
                    className={errors.address?.pin ? 'error' : ''}
                    {...register('address.pin', {
                      required: 'PIN is required',
                      pattern: { value: /^[1-9][0-9]{5}$/, message: 'Valid 6-digit PIN required' }
                    })}
                  />
                </div>
                {errors.address?.pin && <p className="error-text">{errors.address.pin.message}</p>}
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <div className="input-icon"><Phone size={18} /></div>
                <input
                  type="tel"
                  id="reg-contact"
                  placeholder="Contact Number"
                  className={errors.address?.contactNumber ? 'error' : ''}
                  {...register('address.contactNumber', {
                    required: 'Contact number is required',
                    pattern: { value: /^[6-9][0-9]{9}$/, message: 'Valid 10-digit mobile number required' }
                  })}
                />
              </div>
              {errors.address?.contactNumber && <p className="error-text">{errors.address.contactNumber.message}</p>}
            </div>
          </div>

          <div className={`form-step ${step === 3 ? 'active' : ''} ${step < 3 ? 'right' : ''}`}>
            <div className="confirmation-card">
              <div className="confirm-icon">
                <Leaf size={40} />
              </div>
              <h3>Almost there!</h3>
              <p>Review your details and create your account</p>
              <div className="confirm-details">
                <div className="confirm-row">
                  <span className="confirm-label">Username</span>
                  <span className="confirm-value">{watch('username')}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Email</span>
                  <span className="confirm-value">{watch('email')}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Type</span>
                  <span className="confirm-value capitalize">{watch('accountType')}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Location</span>
                  <span className="confirm-value">{watch('address.district')}, {watch('address.state')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="step-actions">
            {step > 1 && (
              <button type="button" className="step-btn back" onClick={prevStep}>
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            )}

            {step < 3 ? (
              <button type="button" className="step-btn next" onClick={nextStep}>
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button type="submit" className="step-btn submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="btn-loading">
                    <div className="loading-spinner small"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Register
