"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { AuthContext } from "../context/AuthContext"
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share"
import { FaHeart, FaRegHeart, FaReply, FaEdit, FaTrash, FaFlag, FaRegThumbsUp } from "react-icons/fa"
import "./SingleBlog.css"

const SingleBlog = () => {
  const { id } = useParams()
  const { currentUser } = useContext(AuthContext)
  const [blog, setBlog] = useState(null)
  const [comments, setComments] = useState([])
  const [replies, setReplies] = useState({})
  const [newComment, setNewComment] = useState("")
  const [replyText, setReplyText] = useState({})
  const [editCommentId, setEditCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentLikes, setCommentLikes] = useState({})

  const shareUrl = window.location.href

  useEffect(() => {
    const fetchBlogAndComments = async () => {
      try {
        // Fetch blog
        const blogResponse = await axios.get(`http://localhost:3001/blogs/${id}`)
        setBlog(blogResponse.data)
        setLikeCount(blogResponse.data.likes || 0)

        // Check if user has liked this blog
        if (currentUser) {
          const likesResponse = await axios.get(
            `http://localhost:3001/likes?userId=${currentUser.id}&blogId=${Number.parseInt(id)}`,
          )
          setLiked(likesResponse.data.length > 0)
        }

        // Fetch comments
        const commentsResponse = await axios.get(
          `http://localhost:3001/comments?blogId=${Number.parseInt(id)}&parentId=null&_sort=createdAt&_order=desc`,
        )
        setComments(commentsResponse.data)

        // Fetch replies
        const repliesResponse = await axios.get(
          `http://localhost:3001/comments?blogId=${Number.parseInt(id)}&parentId_ne=null&_sort=createdAt&_order=asc`,
        )

        // Group replies by parent comment ID
        const repliesMap = {}
        repliesResponse.data.forEach((reply) => {
          if (!repliesMap[reply.parentId]) {
            repliesMap[reply.parentId] = []
          }
          repliesMap[reply.parentId].push(reply)
        })

        setReplies(repliesMap)

        // Fetch comment likes for current user
        if (currentUser) {
          const commentLikesResponse = await axios.get(`http://localhost:3001/commentLikes?userId=${currentUser.id}`)
          const likesMap = {}
          commentLikesResponse.data.forEach((like) => {
            likesMap[like.commentId] = true
          })
          setCommentLikes(likesMap)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        if (error.response && error.response.status === 404) {
          toast.error("Blog not found")
        } else if (error.code === "ERR_NETWORK") {
          toast.error("Network error. Is the JSON server running?")
        } else {
          toast.error("Failed to load blog: " + (error.message || "Unknown error"))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBlogAndComments()
  }, [id, currentUser])

  const handleLikeBlog = async () => {
    if (!currentUser) {
      toast.error("Please log in to like this blog")
      return
    }

    try {
      if (liked) {
        // Unlike the blog
        const likesResponse = await axios.get(
          `http://localhost:3001/likes?userId=${currentUser.id}&blogId=${Number.parseInt(id)}`,
        )
        if (likesResponse.data.length > 0) {
          await axios.delete(`http://localhost:3001/likes/${likesResponse.data[0].id}`)
        }

        // Update local state
        setLiked(false)
        const newLikeCount = Math.max(0, likeCount - 1)
        setLikeCount(newLikeCount)

        // Update blog likes count in database
        await axios.patch(`http://localhost:3001/blogs/${id}`, { likes: newLikeCount })
      } else {
        // Like the blog
        await axios.post(`http://localhost:3001/likes`, {
          userId: currentUser.id,
          blogId: Number.parseInt(id),
          createdAt: new Date().toISOString(),
        })

        // Update local state
        setLiked(true)
        const newLikeCount = likeCount + 1
        setLikeCount(newLikeCount)

        // Update blog likes count in database
        await axios.patch(`http://localhost:3001/blogs/${id}`, { likes: newLikeCount })
      }
    } catch (error) {
      console.error("Error updating like status:", error)
      toast.error("Failed to update like status")
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      toast.error("Please log in to comment")
      return
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    setSubmitting(true)

    try {
      const commentData = {
        blogId: Number.parseInt(id),
        parentId: null,
        userId: currentUser.id,
        userName: currentUser.name,
        userProfilePic: currentUser.profilePic || "/default-profile.jpg",
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
      }

      const response = await axios.post("http://localhost:3001/comments", commentData)
      setComments([response.data, ...comments])
      setNewComment("")
      toast.success("Comment posted successfully")
    } catch (error) {
      console.error("Error posting comment:", error)
      toast.error("Failed to post comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplySubmit = async (commentId) => {
    if (!currentUser) {
      toast.error("Please log in to reply")
      return
    }

    if (!replyText[commentId] || !replyText[commentId].trim()) {
      toast.error("Reply cannot be empty")
      return
    }

    try {
      const replyData = {
        blogId: Number.parseInt(id),
        parentId: commentId,
        userId: currentUser.id,
        userName: currentUser.name,
        userProfilePic: currentUser.profilePic || "/default-profile.jpg",
        content: replyText[commentId],
        createdAt: new Date().toISOString(),
        likes: 0,
      }

      const response = await axios.post("http://localhost:3001/comments", replyData)

      // Update replies state
      setReplies((prev) => {
        const newReplies = { ...prev }
        if (!newReplies[commentId]) {
          newReplies[commentId] = []
        }
        newReplies[commentId] = [...newReplies[commentId], response.data]
        return newReplies
      })

      // Clear reply text and close reply form
      setReplyText((prev) => ({ ...prev, [commentId]: "" }))
      setReplyingTo(null)

      toast.success("Reply posted successfully")
    } catch (error) {
      console.error("Error posting reply:", error)
      toast.error("Failed to post reply")
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    try {
      const response = await axios.patch(`http://localhost:3001/comments/${commentId}`, {
        content: editCommentText,
      })

      // Update comments or replies based on whether it's a parent comment or reply
      const updatedComment = response.data

      if (updatedComment.parentId === null) {
        // It's a parent comment
        setComments(comments.map((comment) => (comment.id === commentId ? updatedComment : comment)))
      } else {
        // It's a reply
        setReplies((prev) => {
          const newReplies = { ...prev }
          if (newReplies[updatedComment.parentId]) {
            newReplies[updatedComment.parentId] = newReplies[updatedComment.parentId].map((reply) =>
              reply.id === commentId ? updatedComment : reply,
            )
          }
          return newReplies
        })
      }

      setEditCommentId(null)
      setEditCommentText("")
      toast.success("Comment updated successfully")
    } catch (error) {
      console.error("Error updating comment:", error)
      toast.error("Failed to update comment")
    }
  }

  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    try {
      await axios.delete(`http://localhost:3001/comments/${commentId}`)

      if (isReply) {
        // Delete reply
        setReplies((prev) => {
          const newReplies = { ...prev }
          if (newReplies[parentId]) {
            newReplies[parentId] = newReplies[parentId].filter((reply) => reply.id !== commentId)
          }
          return newReplies
        })
      } else {
        // Delete parent comment and all its replies
        setComments(comments.filter((comment) => comment.id !== commentId))

        // Also delete all replies to this comment from the database
        if (replies[commentId] && replies[commentId].length > 0) {
          for (const reply of replies[commentId]) {
            await axios.delete(`http://localhost:3001/comments/${reply.id}`)
          }
        }

        setReplies((prev) => {
          const newReplies = { ...prev }
          delete newReplies[commentId]
          return newReplies
        })
      }

      toast.success("Comment deleted successfully")
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  const handleLikeComment = async (commentId, isReply = false, parentId = null) => {
    if (!currentUser) {
      toast.error("Please log in to like comments")
      return
    }

    try {
      const isLiked = commentLikes[commentId]

      if (isLiked) {
        // User already liked, so unlike
        const likesResponse = await axios.get(
          `http://localhost:3001/commentLikes?userId=${currentUser.id}&commentId=${commentId}`,
        )

        if (likesResponse.data.length > 0) {
          await axios.delete(`http://localhost:3001/commentLikes/${likesResponse.data[0].id}`)
        }

        // Get current comment to update likes count
        const commentResponse = await axios.get(`http://localhost:3001/comments/${commentId}`)
        const currentLikes = commentResponse.data.likes || 0
        const newLikeCount = Math.max(0, currentLikes - 1)

        // Update comment likes count
        const updatedComment = await axios.patch(`http://localhost:3001/comments/${commentId}`, {
          likes: newLikeCount,
        })

        // Update local state
        setCommentLikes((prev) => ({
          ...prev,
          [commentId]: false,
        }))

        if (isReply) {
          setReplies((prev) => {
            const newReplies = { ...prev }
            if (newReplies[parentId]) {
              newReplies[parentId] = newReplies[parentId].map((reply) =>
                reply.id === commentId ? updatedComment.data : reply,
              )
            }
            return newReplies
          })
        } else {
          setComments(comments.map((comment) => (comment.id === commentId ? updatedComment.data : comment)))
        }
      } else {
        // User hasn't liked, so add like
        await axios.post(`http://localhost:3001/commentLikes`, {
          userId: currentUser.id,
          commentId: commentId,
          createdAt: new Date().toISOString(),
        })

        // Get current comment to update likes count
        const commentResponse = await axios.get(`http://localhost:3001/comments/${commentId}`)
        const currentLikes = commentResponse.data.likes || 0
        const newLikeCount = currentLikes + 1

        // Update comment likes count
        const updatedComment = await axios.patch(`http://localhost:3001/comments/${commentId}`, {
          likes: newLikeCount,
        })

        // Update local state
        setCommentLikes((prev) => ({
          ...prev,
          [commentId]: true,
        }))

        if (isReply) {
          setReplies((prev) => {
            const newReplies = { ...prev }
            if (newReplies[parentId]) {
              newReplies[parentId] = newReplies[parentId].map((reply) =>
                reply.id === commentId ? updatedComment.data : reply,
              )
            }
            return newReplies
          })
        } else {
          setComments(comments.map((comment) => (comment.id === commentId ? updatedComment.data : comment)))
        }
      }
    } catch (error) {
      console.error("Error updating comment like:", error)
      toast.error("Failed to update like")
    }
  }

  const handleReportComment = async (commentId) => {
    if (!currentUser) {
      toast.error("Please log in to report comments")
      return
    }

    try {
      // Check if user already reported this comment
      const reportsResponse = await axios.get(
        `http://localhost:3001/reports?userId=${currentUser.id}&commentId=${commentId}`,
      )

      if (reportsResponse.data.length > 0) {
        toast.info("You have already reported this comment")
        return
      }

      // Add report
      await axios.post(`http://localhost:3001/reports`, {
        userId: currentUser.id,
        commentId: commentId,
        blogId: Number.parseInt(id),
        type: "comment",
        reason: "Inappropriate content",
        status: "pending",
        createdAt: new Date().toISOString(),
      })

      toast.success("Comment reported successfully. An admin will review it.")
    } catch (error) {
      console.error("Error reporting comment:", error)
      toast.error("Failed to report comment")
    }
  }

  const handleReportBlog = async () => {
    if (!currentUser) {
      toast.error("Please log in to report this blog")
      return
    }

    try {
      // Check if user already reported this blog
      const reportsResponse = await axios.get(
        `http://localhost:3001/reports?userId=${currentUser.id}&blogId=${Number.parseInt(id)}&type=blog`,
      )

      if (reportsResponse.data.length > 0) {
        toast.info("You have already reported this blog")
        return
      }

      // Add report
      await axios.post(`http://localhost:3001/reports`, {
        userId: currentUser.id,
        blogId: Number.parseInt(id),
        type: "blog",
        reason: "Inappropriate content",
        status: "pending",
        createdAt: new Date().toISOString(),
      })

      toast.success("Blog reported successfully. An admin will review it.")
    } catch (error) {
      console.error("Error reporting blog:", error)
      toast.error("Failed to report blog")
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading blog...</p>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="not-found">
        <h2>Blog not found</h2>
        <p>The blog you're looking for doesn't exist or has been removed.</p>
        <Link to="/blogs" className="btn btn-primary">
          Back to Blogs
        </Link>
      </div>
    )
  }

  return (
    <div className="single-blog-page">
      <div className="single-blog-header">
        <div className="blog-category-tag">{blog.category}</div>
        <h1>{blog.title}</h1>
        <div className="blog-meta">
          <span className="blog-author">By {blog.authorName}</span>
          <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="single-blog-image">
        <img src={blog.imageUrl || "/placeholder.svg"} alt={blog.title} />
      </div>

      <div className="blog-actions">
        <button
          className={`like-button ${liked ? "liked" : ""}`}
          onClick={handleLikeBlog}
          aria-label={liked ? "Unlike this blog" : "Like this blog"}
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
          <span>{likeCount}</span>
        </button>

        <button className="report-button" onClick={handleReportBlog} aria-label="Report this blog">
          <FaFlag /> Report
        </button>
      </div>

      <div className="single-blog-content">
        {blog.content.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="blog-share-section">
        <h3>Share this article</h3>
        <div className="share-buttons">
          <FacebookShareButton url={shareUrl} quote={blog.title}>
            <FacebookIcon size={40} round />
          </FacebookShareButton>

          <TwitterShareButton url={shareUrl} title={blog.title}>
            <TwitterIcon size={40} round />
          </TwitterShareButton>

          <WhatsappShareButton url={shareUrl} title={blog.title}>
            <WhatsappIcon size={40} round />
          </WhatsappShareButton>

          <EmailShareButton url={shareUrl} subject={blog.title} body={`Check out this article: ${blog.title}`}>
            <EmailIcon size={40} round />
          </EmailShareButton>
        </div>
      </div>

      <div className="blog-comments-section">
        <h3>Comments ({comments.length})</h3>

        {currentUser ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <div className="comment-input-container">
              <img
                src={currentUser.profilePic || "/default-profile.jpg"}
                alt={currentUser.name}
                className="comment-user-avatar"
              />
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <div className="login-to-comment">
            <p>
              Please <Link to="/login">log in</Link> to leave a comment.
            </p>
          </div>
        )}

        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <img
                    src={comment.userProfilePic || "/default-profile.jpg"}
                    alt={comment.userName}
                    className="comment-user-avatar"
                  />
                  <div className="comment-user-info">
                    <h4>{comment.userName}</h4>
                    <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Comment Actions */}
                  <div className="comment-actions">
                    {currentUser && (currentUser.id === comment.userId || currentUser.role === "admin") && (
                      <>
                        <button
                          className="comment-action-btn edit-btn"
                          onClick={() => {
                            setEditCommentId(comment.id)
                            setEditCommentText(comment.content)
                          }}
                          aria-label="Edit comment"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="comment-action-btn delete-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                          aria-label="Delete comment"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}

                    {currentUser && currentUser.id !== comment.userId && (
                      <button
                        className="comment-action-btn report-btn"
                        onClick={() => handleReportComment(comment.id)}
                        aria-label="Report comment"
                      >
                        <FaFlag />
                      </button>
                    )}
                  </div>
                </div>

                <div className="comment-content">
                  {editCommentId === comment.id ? (
                    <div className="edit-comment-form">
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        required
                      ></textarea>
                      <div className="edit-actions">
                        <button className="btn btn-primary" onClick={() => handleEditComment(comment.id)}>
                          Save
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditCommentId(null)
                            setEditCommentText("")
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{comment.content}</p>
                  )}
                </div>

                <div className="comment-footer">
                  <button
                    className={`comment-like-btn ${commentLikes[comment.id] ? "liked" : ""}`}
                    onClick={() => handleLikeComment(comment.id)}
                    aria-label="Like comment"
                  >
                    <FaRegThumbsUp /> <span>{comment.likes || 0}</span>
                  </button>

                  {currentUser && (
                    <button
                      className="comment-reply-btn"
                      onClick={() => {
                        setReplyingTo(replyingTo === comment.id ? null : comment.id)
                        setReplyText({ ...replyText, [comment.id]: replyText[comment.id] || "" })
                      }}
                      aria-label="Reply to comment"
                    >
                      <FaReply /> Reply
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="reply-form">
                    <div className="reply-input-container">
                      <img
                        src={currentUser.profilePic || "/default-profile.jpg"}
                        alt={currentUser.name}
                        className="reply-user-avatar"
                      />
                      <textarea
                        placeholder={`Reply to ${comment.userName}...`}
                        value={replyText[comment.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="reply-actions">
                      <button className="btn btn-primary" onClick={() => handleReplySubmit(comment.id)}>
                        Post Reply
                      </button>
                      <button className="btn btn-secondary" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {replies[comment.id] && replies[comment.id].length > 0 && (
                  <div className="replies-container">
                    {replies[comment.id].map((reply) => (
                      <div key={reply.id} className="reply-item">
                        <div className="reply-header">
                          <img
                            src={reply.userProfilePic || "/default-profile.jpg"}
                            alt={reply.userName}
                            className="reply-user-avatar"
                          />
                          <div className="reply-user-info">
                            <h5>{reply.userName}</h5>
                            <span className="reply-date">{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Reply Actions */}
                          <div className="reply-actions">
                            {currentUser && (currentUser.id === reply.userId || currentUser.role === "admin") && (
                              <>
                                <button
                                  className="comment-action-btn edit-btn"
                                  onClick={() => {
                                    setEditCommentId(reply.id)
                                    setEditCommentText(reply.content)
                                  }}
                                  aria-label="Edit reply"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="comment-action-btn delete-btn"
                                  onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                  aria-label="Delete reply"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}

                            {currentUser && currentUser.id !== reply.userId && (
                              <button
                                className="comment-action-btn report-btn"
                                onClick={() => handleReportComment(reply.id)}
                                aria-label="Report reply"
                              >
                                <FaFlag />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="reply-content">
                          {editCommentId === reply.id ? (
                            <div className="edit-comment-form">
                              <textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                required
                              ></textarea>
                              <div className="edit-actions">
                                <button className="btn btn-primary" onClick={() => handleEditComment(reply.id)}>
                                  Save
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    setEditCommentId(null)
                                    setEditCommentText("")
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p>{reply.content}</p>
                          )}
                        </div>

                        <div className="reply-footer">
                          <button
                            className={`comment-like-btn ${commentLikes[reply.id] ? "liked" : ""}`}
                            onClick={() => handleLikeComment(reply.id, true, comment.id)}
                            aria-label="Like reply"
                          >
                            <FaRegThumbsUp /> <span>{reply.likes || 0}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>

      <div className="single-blog-footer">
        <Link to="/blogs" className="btn btn-outline">
          Back to Blogs
        </Link>
      </div>
    </div>
  )
}

export default SingleBlog

