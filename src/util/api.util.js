import axios from "axios"

// Base API configuration
const API_BASE_URL = "http://localhost:3001"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - could be used for adding auth tokens, etc.
api.interceptors.request.use(
  (config) => {
    // You could add authorization headers here
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - for global error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Global error handling
    console.error("API Error:", error)
    return Promise.reject(error)
  },
)

export default api

