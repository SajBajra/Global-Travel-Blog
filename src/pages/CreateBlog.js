import { useState, useEffect, useContext, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { AuthContext } from "../context/AuthContext"
import { FiImage, FiX, FiArrowLeft, FiCheck, FiFileText, FiTag, FiEdit3 } from "react-icons/fi"
import "./CreateBlog.css"

const CreateBlog = () => {
  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    imageUrl: "",
  })

  const [previewImage, setPreviewImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [contentLength, setContentLength] = useState(0)
  const [formProgress, setFormProgress] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await axios.get("http://localhost:3001/categories")
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load form data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate form completion progress
  useEffect(() => {
    let progress = 0
    if (formData.title.trim()) progress += 25
    if (formData.category) progress += 25
    if (formData.imageUrl) progress += 25
    if (formData.content.trim()) progress += 25
    setFormProgress(progress)
  }, [formData])

  // Track content length for character count
  useEffect(() => {
    setContentLength(formData.content.length)
  }, [formData.content])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      processImageFile(file)
    }
  }

  const processImageFile = (file) => {
    // In a real app, you would upload to a server
    // For this example, we'll simulate by creating a data URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result)
      setFormData((prev) => ({ ...prev, imageUrl: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0])
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.content || !formData.category || !formData.imageUrl) {
      toast.error("Please fill all required fields")
      return
    }

    setSubmitting(true)

    try {
      const blogData = {
        ...formData,
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: new Date().toISOString(),
        status: "approved", // Blogs are now automatically approved
        likes: 0,
      }

      await axios.post("http://localhost:3001/blogs", blogData)
      toast.success("Blog published successfully")
      navigate("/blogs")
    } catch (error) {
      console.error("Error creating blog:", error)
      toast.error("Failed to create blog")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="create-blog-page">
      <div className="create-blog-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FiArrowLeft />
        </button>

        <div>
          <h1>Write a Blog</h1>
          <p>Share your travel experiences with the community</p>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${formProgress}%` }}></div>
          </div>
          <div className="progress-text">{formProgress}% complete</div>
        </div>
      </div>

      <div className="create-blog-container">
        <form className="blog-form" onSubmit={handleSubmit}>
          <div className="form-columns">
            <div className="form-main-column">
              <div className="form-group">
                <label htmlFor="title">
                  <FiFileText className="form-icon" /> Blog Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a catchy title"
                  className={!formData.title && formProgress > 0 ? "error" : ""}
                  required
                />
                {!formData.title && formProgress > 0 && <div className="error-message">Please enter a title</div>}
              </div>

              <div className="form-group">
                <label htmlFor="content">
                  <FiEdit3 className="form-icon" /> Blog Content <span className="required">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="12"
                  placeholder="Share your travel story..."
                  className={!formData.content && formProgress > 0 ? "error" : ""}
                  required
                ></textarea>
                {!formData.content && formProgress > 0 && <div className="error-message">Please enter content</div>}
                <div className="char-count">{contentLength} characters</div>
              </div>
            </div>

            <div className="form-sidebar-column">
              <div className="form-group">
                <label htmlFor="category">
                  <FiTag className="form-icon" /> Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={!formData.category && formProgress > 0 ? "error" : ""}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {!formData.category && formProgress > 0 && (
                  <div className="error-message">Please select a category</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiImage className="form-icon" /> Blog Image <span className="required">*</span>
                </label>
                <div
                  className={`image-upload-container ${dragActive ? "drag-active" : ""} ${!formData.imageUrl && formProgress > 0 ? "error" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    required
                  />

                  {!previewImage ? (
                    <div className="upload-placeholder">
                      <FiImage className="upload-icon" />
                      <p>Drag & drop an image or click to browse</p>
                      <span>Recommended size: 1200 x 800 pixels</span>
                    </div>
                  ) : (
                    <div className="image-preview-container">
                      <img src={previewImage || "/placeholder.svg"} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImage()
                        }}
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
                {!formData.imageUrl && formProgress > 0 && <div className="error-message">Please upload an image</div>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>Publishing...</>
              ) : (
                <>
                  <FiCheck /> Publish Blog
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBlog

