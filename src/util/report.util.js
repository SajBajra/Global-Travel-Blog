import api from "./api.util"
import toastUtil from "./toast.util"

const reportUtil = {
  // Get all reports
  getAllReports: async () => {
    try {
      const response = await api.get("/reports?_sort=createdAt&_order=desc")
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch reports")
      throw error
    }
  },

  // Get reports by status
  getReportsByStatus: async (status) => {
    try {
      const response = await api.get(`/reports?status=${status}&_sort=createdAt&_order=desc`)
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch reports")
      throw error
    }
  },

  // Report a blog
  reportBlog: async (userId, blogId, reason = "Inappropriate content") => {
    try {
      // Check if user already reported this blog
      const reportsResponse = await api.get(`/reports?userId=${userId}&blogId=${blogId}&type=blog`)

      if (reportsResponse.data.length > 0) {
        toastUtil.info("You have already reported this blog")
        return { success: false, message: "You have already reported this blog" }
      }

      // Add report
      await api.post(`/reports`, {
        userId,
        blogId: Number.parseInt(blogId),
        type: "blog",
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      })

      toastUtil.success("Blog reported successfully. An admin will review it.")
      return { success: true }
    } catch (error) {
      toastUtil.error("Failed to report blog")
      return { success: false, message: "Failed to report blog" }
    }
  },

  // Report a comment
  reportComment: async (userId, commentId, blogId, reason = "Inappropriate content") => {
    try {
      // Check if user already reported this comment
      const reportsResponse = await api.get(`/reports?userId=${userId}&commentId=${commentId}`)

      if (reportsResponse.data.length > 0) {
        toastUtil.info("You have already reported this comment")
        return { success: false, message: "You have already reported this comment" }
      }

      // Add report
      await api.post(`/reports`, {
        userId,
        commentId,
        blogId: Number.parseInt(blogId),
        type: "comment",
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      })

      toastUtil.success("Comment reported successfully. An admin will review it.")
      return { success: true }
    } catch (error) {
      toastUtil.error("Failed to report comment")
      return { success: false, message: "Failed to report comment" }
    }
  },

  // Update report status (admin only)
  updateReportStatus: async (reportId, status) => {
    try {
      await api.patch(`/reports/${reportId}`, {
        status,
        resolvedAt: new Date().toISOString(),
      })

      toastUtil.success(`Report marked as ${status}`)
      return { success: true }
    } catch (error) {
      toastUtil.error("Failed to update report status")
      return { success: false, message: "Failed to update report status" }
    }
  },
}

export default reportUtil

