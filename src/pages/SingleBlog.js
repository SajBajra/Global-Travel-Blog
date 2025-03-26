"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, Link } from "react-router"
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
import "./SingleBlog.css"

const SingleBlog = () => {
  const { id } = useParams()
  const { currentUser } = useContext(AuthContext)
  const [blog, setBlog] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const shareUrl = window.location.href

  useEffect(() => {
    const fetchBlogAndComments = async () => {
      try {
        // Fetch blog
        const blogResponse = await axios.get(`http://localhost:3001/blogs/${id}`)
        setBlog(blogResponse.data)

        // Fetch comments
        const commentsResponse = await axios.get(
          `http://localhost:3001/comments?blogId=${id}&_sort=createdAt&_order=desc`,
        )
        setComments(commentsResponse.data)
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
  }, [id])

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
        userId: currentUser.id,
        userName: currentUser.name,
        userProfilePic: currentUser.profilePic || "/default-profile.jpg",
        content: newComment,
        createdAt: new Date().toISOString(),
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

  if (loading) {
    return <div className="loading">Loading...</div>
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
                </div>
                <div className="comment-content">
                  <p>{comment.content}</p>
                </div>
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

