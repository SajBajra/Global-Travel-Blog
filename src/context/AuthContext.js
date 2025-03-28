import { createContext, useState, useEffect } from "react"
import { userUtil, toastUtil } from "../util"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const userId = localStorage.getItem("userId")
        if (userId) {
          const user = await userUtil.getUserById(userId)
          setCurrentUser(user)
          setIsAdmin(user.role === "admin")
        }
      } catch (error) {
        console.error("Error checking login status:", error)
        localStorage.removeItem("userId")
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  const login = async (email, password) => {
    try {
      const result = await userUtil.login(email, password)

      if (result.success) {
        setCurrentUser(result.user)
        setIsAdmin(result.user.role === "admin")
        localStorage.setItem("userId", result.user.id)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      toastUtil.error("Login failed")
      return false
    }
  }

  const signup = async (name, email, password) => {
    try {
      const userData = {
        name,
        email,
        password,
      }

      const result = await userUtil.signup(userData)

      if (result.success) {
        setCurrentUser(result.user)
        localStorage.setItem("userId", result.user.id)
        return true
      }

      return false
    } catch (error) {
      console.error("Signup error:", error)
      toastUtil.error("Signup failed")
      return false
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setIsAdmin(false)
    localStorage.removeItem("userId")
    toastUtil.success("Logged out successfully")
  }

  const updateProfile = async (userData) => {
    try {
      const result = await userUtil.updateProfile(currentUser.id, userData)

      if (result.success) {
        setCurrentUser(result.user)
        return true
      }

      return false
    } catch (error) {
      console.error("Update profile error:", error)
      toastUtil.error("Failed to update profile")
      return false
    }
  }

  const uploadProfilePicture = async (file) => {
    try {
      const result = await userUtil.uploadProfilePicture(currentUser.id, file)
      return result.success
    } catch (error) {
      console.error("Upload error:", error)
      toastUtil.error("Failed to upload profile picture")
      return false
    }
  }

  const value = {
    currentUser,
    isAdmin,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    uploadProfilePicture,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

