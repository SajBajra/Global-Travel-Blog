import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { FiClock, FiSearch, FiFilter, FiHeart, FiEdit, FiChevronRight, FiX } from "react-icons/fi"
import "./Blogs.css"

const Blogs = () => {
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

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

  // Calculate estimated read time based on content length
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return readTime < 1 ? 1 : readTime
  }

  // Filter blogs based on search term and category
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? blog.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing travel stories...</p>
      </div>
    )
  }

  return (
    <div className="blogs-page">
      <div className="blogs-header">
        <h1>Travel Blogs</h1>
        <p>Explore inspiring travel stories from our global community of adventurers</p>

        <div className="blogs-filters">
          <div className={`search-container ${isSearchFocused ? "focused" : ""}`}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")} aria-label="Clear search">
                <FiX />
              </button>
            )}
          </div>

          <div className="category-filter">
            <FiFilter className="filter-icon" />
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
            <FiEdit /> Write a Blog
          </Link>
        </div>
      </div>

      {filteredBlogs.length > 0 ? (
        <>
          <div className="blogs-count">
            Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? "blog" : "blogs"}
            {selectedCategory && (
              <span>
                {" "}
                in <strong>{selectedCategory}</strong>
              </span>
            )}
            {searchTerm && (
              <span>
                {" "}
                matching <strong>"{searchTerm}"</strong>
              </span>
            )}
          </div>

          <div className="blogs-container">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="blog-card">
                <div className="blog-image">
                  <img src={blog.imageUrl || "/placeholder.svg"} alt={blog.title} />
                  <span className="blog-category">{blog.category}</span>
                  <div className="blog-likes">
                    <FiHeart /> {blog.likes || 0}
                  </div>
                </div>
                <div className="blog-content">
                  <h2>{blog.title}</h2>
                  <div className="blog-meta">
                    <span className="blog-author">By {blog.authorName}</span>
                    <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="blog-excerpt">{blog.content.substring(0, 150)}...</p>
                  <div className="blog-footer">
                    <Link to={`/blogs/${blog.id}`} className="btn-read-more">
                      Read More <FiChevronRight />
                    </Link>
                    <div className="blog-read-time">
                      <FiClock /> {calculateReadTime(blog.content)} min read
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No blogs found</h3>
          <p>We couldn't find any blogs matching your search criteria.</p>
          {(searchTerm || selectedCategory) && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("")
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blogs

