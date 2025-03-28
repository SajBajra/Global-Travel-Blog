import api from "./api.util"
import toastUtil from "./toast.util"

const commentUtil = {
  // Get comments for a blog
  getBlogComments: async (blogId, parentId = null) => {
    try {
      const query =
        parentId === null
          ? `/comments?blogId=${blogId}&parentId=null&_sort=createdAt&_order=desc`
          : `/comments?blogId=${blogId}&parentId=${parentId}&_sort=createdAt&_order=asc`

      const response = await api.get(query)
      return response.data
    } catch (error) {
      toastUtil.error("Failed to fetch comments")
      throw error
    }
  },

  // Get all replies for a blog
  getBlogReplies: async (blogId) => {
    try {
      const response = await api.get(`/comments?blogId=${blogId}&parentId_ne=null&_sort=createdAt&_order=asc`)

      // Group replies by parent comment ID
      const repliesMap = {}
      response.data.forEach((reply) => {
        if (!repliesMap[reply.parentId]) {
          repliesMap[reply.parentId] = []
        }
        repliesMap[reply.parentId].push(reply)
      })

      return repliesMap
    } catch (error) {
      toastUtil.error("Failed to fetch replies")
      throw error
    }
  },

  // Add a comment
  addComment: async (commentData) => {
    try {
      const response = await api.post("/comments", {
        ...commentData,
        createdAt: new Date().toISOString(),
        likes: 0,
      })

      toastUtil.success("Comment posted successfully")
      return { success: true, comment: response.data }
    } catch (error) {
      toastUtil.error("Failed to post comment")
      return { success: false, message: "Failed to post comment" }
    }
  },

  // Update a comment
  updateComment: async (commentId, content) => {
    try {
      const response = await api.patch(`/comments/${commentId}`, { content })
      toastUtil.success("Comment updated successfully")
      return { success: true, comment: response.data }
    } catch (error) {
      toastUtil.error("Failed to update comment")
      return { success: false, message: "Failed to update comment" }
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`)
      toastUtil.success("Comment deleted successfully")
      return { success: true }
    } catch (error) {
      toastUtil.error("Failed to delete comment")
      return { success: false, message: "Failed to delete comment" }
    }
  },

  // Like/unlike a comment
  toggleLikeComment: async (commentId, userId, isLiked) => {
    try {
      if (isLiked) {
        // Unlike the comment
        const likesResponse = await api.get(`/commentLikes?userId=${userId}&commentId=${commentId}`)

        if (likesResponse.data.length > 0) {
          await api.delete(`/commentLikes/${likesResponse.data[0].id}`)
        }

        // Get current comment to update likes count
        const commentResponse = await api.get(`/comments/${commentId}`)
        const currentLikes = commentResponse.data.likes || 0
        const newLikeCount = Math.max(0, currentLikes - 1)

        // Update comment likes count
        const updatedComment = await api.patch(`/comments/${commentId}`, { likes: newLikeCount })

        return { success: true, liked: false, comment: updatedComment.data }
      } else {
        // Like the comment
        await api.post(`/commentLikes`, {
          userId,
          commentId,
          createdAt: new Date().toISOString(),
        })

        // Get current comment to update likes count
        const commentResponse = await api.get(`/comments/${commentId}`)
        const currentLikes = commentResponse.data.likes || 0
        const newLikeCount = currentLikes + 1

        // Update comment likes count
        const updatedComment = await api.patch(`/comments/${commentId}`, { likes: newLikeCount })

        return { success: true, liked: true, comment: updatedComment.data }
      }
    } catch (error) {
      toastUtil.error("Failed to update comment like")
      return { success: false, message: "Failed to update comment like" }
    }
  },

  // Check if user has liked comments
  getUserCommentLikes: async (userId) => {
    try {
      const response = await api.get(`/commentLikes?userId=${userId}`)
      const likesMap = {}

      response.data.forEach((like) => {
        likesMap[like.commentId] = true
      })

      return likesMap
    } catch (error) {
      console.error("Error fetching comment likes:", error)
      return {}
    }
  },
}

export default commentUtil

