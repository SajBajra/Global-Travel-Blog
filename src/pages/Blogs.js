import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import "./Blogs.css"

const Blogs = () => {
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch blogs
        const blogsRes = await axios.get("http://localhost:3001/blogs?_sort=createdAt&_order=desc")
        setBlogs(blogsRes.data)

        // Fetch categories
        const categoriesRes = await axios.get("http://localhost:3001/categories")
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter blogs based on search term and category
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? blog.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="blogs-page">
      <div className="blogs-header">
        <h1>Travel Blogs</h1>
        <p>Explore travel stories from our community</p>

        <div className="blogs-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="write-blog-cta">
          <Link to="/create-blog" className="btn btn-primary">
            Write a Blog
          </Link>
        </div>
      </div>

      <div className="blogs-container">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div key={blog.id} className="blog-card">
              <div className="blog-image">
                <img src={blog.imageUrl || "/placeholder.svg"} alt={blog.title} />
                <span className="blog-category">{blog.category}</span>
              </div>
              <div className="blog-content">
                <h2>{blog.title}</h2>
                <div className="blog-meta">
                  <span className="blog-author">By {blog.authorName}</span>
                  <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="blog-excerpt">{blog.content.substring(0, 200)}...</p>
                <div className="blog-footer">
                  <Link to={`/blogs/${blog.id}`} className="btn btn-text">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No blogs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Blogs

