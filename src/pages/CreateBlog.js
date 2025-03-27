import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { AuthContext } from "../context/AuthContext"
import "./CreateBlog.css"

const CreateBlog = () => {
  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }))
      }
      reader.readAsDataURL(file)
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
        <h1>Write a Blog</h1>
        <p>Share your travel experiences with the community</p>
      </div>

      <form className="blog-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Blog Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a catchy title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Blog Image</label>
          <input type="file" id="image" accept="image/*" onChange={handleImageChange} required />
          {previewImage && (
            <div className="image-preview">
              <img src={previewImage || "/placeholder.svg"} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">Blog Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="10"
            placeholder="Share your travel story..."
            required
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Publishing..." : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateBlog

