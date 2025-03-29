import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { FiCheck, FiX, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi"
import "./Auth.css"

const Signup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation states
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [hasMinLength, setHasMinLength] = useState(false)
  const [hasCapital, setHasCapital] = useState(false)
  const [hasNumber, setHasNumber] = useState(false)
  const [hasSpecial, setHasSpecial] = useState(false)
  const [hasLowercase, setHasLowercase] = useState(false)

  const { signup } = useContext(AuthContext)
  const navigate = useNavigate()

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov)$/i
    if (!emailRegex.test(email)) {
      setEmailError("Email must be a valid format (e.g., example@domain.com)")
      return false
    }
    setEmailError("")
    return true
  }

  // Calculate password strength and validate requirements
  useEffect(() => {
    if (password) {
      // Check requirements
      const minLength = password.length >= 8
      const hasUppercase = /[A-Z]/.test(password)
      const hasLower = /[a-z]/.test(password)
      const hasDigit = /[0-9]/.test(password)
      const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)

      // Update state for each requirement
      setHasMinLength(minLength)
      setHasCapital(hasUppercase)
      setHasLowercase(hasLower)
      setHasNumber(hasDigit)
      setHasSpecial(hasSymbol)

      // Calculate strength (0-4)
      let strength = 0
      if (minLength) strength++
      if (hasUppercase) strength++
      if (hasLower) strength++
      if (hasDigit) strength++
      if (hasSymbol) strength++

      setPasswordStrength(strength)

      // Set error message if not all requirements are met
      if (!(minLength && hasUppercase && hasDigit && hasSymbol)) {
        setPasswordError("Password doesn't meet all requirements")
      } else {
        setPasswordError("")
      }

      // Check confirm password if it exists
      if (confirmPassword) {
        validateConfirmPassword(password, confirmPassword)
      }
    }
  }, [password, confirmPassword])

  // Get strength label and color
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { label: "Very Weak", color: "#e74c3c" }
    if (passwordStrength === 1) return { label: "Weak", color: "#e67e22" }
    if (passwordStrength === 2) return { label: "Fair", color: "#f39c12" }
    if (passwordStrength === 3) return { label: "Good", color: "#3498db" }
    if (passwordStrength >= 4) return { label: "Strong", color: "#2ecc71" }
  }

  // Check if passwords match
  const validateConfirmPassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      return false
    }
    setConfirmPasswordError("")
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    const isEmailValid = validateEmail(email)
    const isPasswordValid = hasMinLength && hasCapital && hasNumber && hasSpecial
    const doPasswordsMatch = validateConfirmPassword(password, confirmPassword)

    if (!isEmailValid || !isPasswordValid || !doPasswordsMatch) {
      return
    }

    setLoading(true)

    try {
      const success = await signup(name, email, password)
      if (success) {
        navigate("/profile")
      }
    } finally {
      setLoading(false)
    }
  }

  const strengthInfo = getStrengthLabel()

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Sign Up</h1>
          <p>Join the Global Travel Blog community</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail(email)}
              placeholder="Enter your email"
              className={emailError ? "error" : ""}
              required
            />
            {emailError && (
              <div className="error-message">
                <FiAlertCircle /> {emailError}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className={passwordError && password ? "error" : ""}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {password && (
              <div className="password-strength-container">
                <div className="strength-meter">
                  <div
                    className="strength-meter-fill"
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: strengthInfo.color,
                    }}
                  ></div>
                </div>
                <div className="strength-text" style={{ color: strengthInfo.color }}>
                  {strengthInfo.label}
                </div>
              </div>
            )}

            {password && (
              <div className="password-requirements">
                <h4>Password requirements:</h4>
                <div className="requirements-list">
                  {!hasMinLength && (
                    <div className="requirement">
                      <FiX className="x-icon" />
                      <span>At least 8 characters</span>
                    </div>
                  )}
                  {!hasCapital && (
                    <div className="requirement">
                      <FiX className="x-icon" />
                      <span>Uppercase letter</span>
                    </div>
                  )}
                  {!hasNumber && (
                    <div className="requirement">
                      <FiX className="x-icon" />
                      <span>Number</span>
                    </div>
                  )}
                  {!hasSpecial && (
                    <div className="requirement">
                      <FiX className="x-icon" />
                      <span>Special character</span>
                    </div>
                  )}
                  {hasMinLength && hasCapital && hasNumber && hasSpecial && (
                    <div className="requirement met">
                      <FiCheck className="check-icon" />
                      <span>All requirements met!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={confirmPasswordError ? "error" : ""}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {confirmPasswordError && (
              <div className="error-message">
                <FiAlertCircle /> {confirmPasswordError}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || passwordError || emailError || confirmPasswordError || !password}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup

