import api from "./api.util"
import toastUtil from "./toast.util"

const blogUtil = {
  // Get all blogs
  getAllBlogs: async (sortBy = "createdAt", order = "desc") => {
    try {
      const response = await api.get(`/blogs?_sort=${sortBy}&_order=${order}`)
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch blogs")
      throw error
    }
  },

  // Get blog by ID
  getBlogById: async (blogId) => {
    try {
      const response = await api.get(`/blogs/${blogId}`)
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch blog")
      throw error
    }
  },

  // Get blogs by author
  getBlogsByAuthor: async (authorId) => {
    try {
      const response = await api.get(`/blogs?authorId=${authorId}`)
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch author's blogs")
      throw error
    }
  },

  // Create new blog
  createBlog: async (blogData) => {
    try {
      const response = await api.post("/blogs", {
        ...blogData,
        createdAt: new Date().toISOString(),
        status: "approved", // Blogs are now automatically approved
        likes: 0,
      })

      toastUtil.success("Blog published successfully")
      return { success: true, blog: response.data }
    } catch (error) {
      toastUtil.error("Failed to create blog")
      return { success: false, message: "Failed to create blog" }
    }
  },

  // Update blog
  updateBlog: async (blogId, blogData) => {
    try {
      const response = await api.patch(`/blogs/${blogId}`, blogData)
      toastUtil.success("Blog updated successfully")
      return { success: true, blog: response.data }
    } catch (error) {
      toastUtil.error("Failed to update blog")
      return { success: false, message: "Failed to update blog" }
    }
  },

  // Delete blog
  deleteBlog: async (blogId) => {
    try {
      await api.delete(`/blogs/${blogId}`)
      toastUtil.success("Blog deleted successfully")
      return { success: true }
    } catch (error) {
      toastUtil.error("Failed to delete blog")
      return { success: false, message: "Failed to delete blog" }
    }
  },

  // Like/unlike blog
  toggleLikeBlog: async (blogId, userId, isLiked) => {
    try {
      if (isLiked) {
        // Unlike the blog
        const likesResponse = await api.get(`/likes?userId=${userId}&blogId=${Number.parseInt(blogId)}`)

        if (likesResponse.data.length > 0) {
          await api.delete(`/likes/${likesResponse.data[0].id}`)
        }

        // Get current blog to update likes count
        const blogResponse = await api.get(`/blogs/${blogId}`)
        const newLikeCount = Math.max(0, (blogResponse.data.likes || 0) - 1)

        // Update blog likes count
        await api.patch(`/blogs/${blogId}`, { likes: newLikeCount })

        return { success: true, liked: false, likeCount: newLikeCount }
      } else {
        // Like the blog
        await api.post(`/likes`, {
          userId,
          blogId: Number.parseInt(blogId),
          createdAt: new Date().toISOString(),
        })

        // Get current blog to update likes count
        const blogResponse = await api.get(`/blogs/${blogId}`)
        const newLikeCount = (blogResponse.data.likes || 0) + 1

        // Update blog likes count
        await api.patch(`/blogs/${blogId}`, { likes: newLikeCount })

        return { success: true, liked: true, likeCount: newLikeCount }
      }
    } catch (error) {
      toastUtil.error("Failed to update like status")
      return { success: false, message: "Failed to update like status" }
    }
  },

  // Check if user has liked a blog
  checkBlogLiked: async (blogId, userId) => {
    try {
      const response = await api.get(`/likes?userId=${userId}&blogId=${Number.parseInt(blogId)}`)
      return response.data.length > 0
    } catch (error) {
      console.error("Error checking like status:", error)
      return false
    }
  },
}

export default blogUtil

