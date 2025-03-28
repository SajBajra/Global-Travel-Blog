import api from "./api.util"
import toastUtil from "./toast.util"

const userUtil = {
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch user data")
      throw error
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.get(`/users?email=${email}`)

      if (response.data.length === 0) {
        toastUtil.error("User not found")
        return { success: false, message: "User not found" }
      }

      const user = response.data[0]

      if (user.password !== password) {
        toastUtil.error("Invalid password")
        return { success: false, message: "Invalid password" }
      }

      toastUtil.success("Login successful")
      return { success: true, user }
    } catch (error) {
      toastUtil.error("Login failed")
      return { success: false, message: "Login failed" }
    }
  },

  // Register new user
  signup: async (userData) => {
    try {
      // Check if user already exists
      const checkUser = await api.get(`/users?email=${userData.email}`)

      if (checkUser.data.length > 0) {
        toastUtil.error("User already exists")
        return { success: false, message: "User already exists" }
      }

      const newUser = {
        ...userData,
        role: "user",
        profilePic: "/default-profile.jpg",
        createdAt: new Date().toISOString(),
      }

      const response = await api.post("/users", newUser)
      toastUtil.success("Signup successful")
      return { success: true, user: response.data }
    } catch (error) {
      toastUtil.error("Signup failed")
      return { success: false, message: "Signup failed" }
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.patch(`/users/${userId}`, userData)
      toastUtil.success("Profile updated successfully")
      return { success: true, user: response.data }
    } catch (error) {
      toastUtil.error("Failed to update profile")
      return { success: false, message: "Failed to update profile" }
    }
  },

  // Upload profile picture (simulated)
  uploadProfilePicture: async (userId, file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const imageUrl = reader.result
          const result = await userUtil.updateProfile(userId, { profilePic: imageUrl })
          resolve(result)
        } catch (error) {
          toastUtil.error("Failed to upload profile picture")
          resolve({ success: false, message: "Failed to upload profile picture" })
        }
      }
      reader.readAsDataURL(file)
    })
  },
}

export default userUtil

