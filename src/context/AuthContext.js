"use client"

import { createContext, useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

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
          const response = await axios.get(`http://localhost:3001/users/${userId}`)
          setCurrentUser(response.data)
          setIsAdmin(response.data.role === "admin")
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
      const response = await axios.get(`http://localhost:3001/users?email=${email}`)

      if (response.data.length === 0) {
        toast.error("User not found")
        return false
      }

      const user = response.data[0]

      if (user.password !== password) {
        toast.error("Invalid password")
        return false
      }

      setCurrentUser(user)
      setIsAdmin(user.role === "admin")
      localStorage.setItem("userId", user.id)
      toast.success("Login successful")
      return true
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed")
      return false
    }
  }

  const signup = async (name, email, password) => {
    try {
      // Check if user already exists
      const checkUser = await axios.get(`http://localhost:3001/users?email=${email}`)

      if (checkUser.data.length > 0) {
        toast.error("User already exists")
        return false
      }

      const newUser = {
        name,
        email,
        password,
        role: "user",
        profilePic: "/default-profile.jpg",
        createdAt: new Date().toISOString(),
      }

      const response = await axios.post("http://localhost:3001/users", newUser)
      setCurrentUser(response.data)
      localStorage.setItem("userId", response.data.id)
      toast.success("Signup successful")
      return true
    } catch (error) {
      console.error("Signup error:", error)
      toast.error("Signup failed")
      return false
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setIsAdmin(false)
    localStorage.removeItem("userId")
    toast.success("Logged out successfully")
  }

  const updateProfile = async (userData) => {
    try {
      const response = await axios.patch(`http://localhost:3001/users/${currentUser.id}`, userData)
      setCurrentUser(response.data)
      toast.success("Profile updated successfully")
      return true
    } catch (error) {
      console.error("Update profile error:", error)
      toast.error("Failed to update profile")
      return false
    }
  }

  const uploadProfilePicture = async (file) => {
    // In a real app, you would upload to a server
    // For this example, we'll simulate by creating a data URL
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const imageUrl = reader.result
          await updateProfile({ profilePic: imageUrl })
          resolve(true)
        } catch (error) {
          console.error("Upload error:", error)
          toast.error("Failed to upload profile picture")
          resolve(false)
        }
      }
      reader.readAsDataURL(file)
    })
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

