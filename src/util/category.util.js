import api from "./api.util"
import toastUtil from "./toast.util"

const categoryUtil = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await api.get("/categories")
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch categories")
      throw error
    }
  },

  // Add new category (admin only)
  addCategory: async (categoryName) => {
    try {
      const response = await api.post("/categories", { name: categoryName })
      toastUtil.success("Category added successfully")
      return { success: true, category: response.data }
    } catch (error) {
      toastUtil.error("Failed to add category")
      return { success: false, message: "Failed to add category" }
    }
  },

  // Update category (admin only)
  updateCategory: async (categoryId, categoryName) => {
    try {
      const response = await api.put(`/categories/${categoryId}`, { name: categoryName })
      toastUtil.success("Category updated successfully")
      return { success: true, category: response.data }
    } catch (error) {
      toastUtil.error("Failed to update category")
      return { success: false, message: "Failed to update category" }
    }
  },

  // Delete category (admin only)
  deleteCategory: async (categoryId) => {
    try {
      // Check if category is in use
      const blogsResponse = await api.get(`/blogs?category=${categoryId}`)

      if (blogsResponse.data.length > 0) {
        toastUtil.error("Cannot delete category that is in use by blogs")
        return { success: false, message: "Cannot delete category that is in use by blogs" }
      }

      await api.delete(`/categories/${categoryId}`)
      toastUtil.success("Category deleted successfully")
      return { success: true }
    } catch (error) {
      toastUtil.error("Failed to delete category")
      return { success: false, message: "Failed to delete category" }
    }
  },
}

export default categoryUtil

