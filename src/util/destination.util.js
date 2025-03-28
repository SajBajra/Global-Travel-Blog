import api from "./api.util"
import toastUtil from "./toast.util"

const destinationUtil = {
  // Get all destinations
  getAllDestinations: async () => {
    try {
      const response = await api.get("/destinations")
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch destinations")
      throw error
    }
  },

  // Get featured destinations (limited number)
  getFeaturedDestinations: async (limit = 6) => {
    try {
      const response = await api.get(`/destinations?_limit=${limit}`)
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch featured destinations")
      throw error
    }
  },

  // Get destination by ID
  getDestinationById: async (destinationId) => {
    try {
      const response = await api.get(`/destinations/${destinationId}`)
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch destination")
      throw error
    }
  },

  // Add new destination (admin only)
  addDestination: async (destinationData) => {
    try {
      const response = await api.post("/destinations", destinationData)
      toastUtil.success("Destination added successfully")
      return { success: true, destination: response.data }
    } catch (error) {
      toastUtil.error("Failed to add destination")
      return { success: false, message: "Failed to add destination" }
    }
  },

  // Update destination (admin only)
  updateDestination: async (destinationId, destinationData) => {
    try {
      const response = await api.put(`/destinations/${destinationId}`, destinationData)
      toastUtil.success("Destination updated successfully")
      return { success: true, destination: response.data }
    } catch (error) {
      toastUtil.error("Failed to update destination")
      return { success: false, message: "Failed to update destination" }
    }
  },

  // Delete destination (admin only)
  deleteDestination: async (destinationId) => {
    try {
      await api.delete(`/destinations/${destinationId}`)
      toastUtil.success("Destination deleted successfully")
      return { success: true }
    } catch (error) {
      toastUtil.error("Failed to delete destination")
      return { success: false, message: "Failed to delete destination" }
    }
  },
}

export default destinationUtil

