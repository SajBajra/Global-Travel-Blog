"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router"
import "./Home.css"

const Home = () => {
  const [featuredDestinations, setFeaturedDestinations] = useState([])
  const [recentBlogs, setRecentBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured destinations
        const destinationsRes = await axios.get("http://localhost:3001/destinations?_limit=3")
        setFeaturedDestinations(destinationsRes.data)

        // Fetch recent blogs
        const blogsRes = await axios.get("http://localhost:3001/blogs?_sort=createdAt&_order=desc&_limit=4")
        setRecentBlogs(blogsRes.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Explore the World with Global Travel Blog</h1>
          <p>Discover amazing destinations and share your travel experiences</p>
          <Link to="/destinations" className="btn btn-primary">
            Explore Destinations
          </Link>
        </div>
      </section>

      <section className="featured-destinations">
        <h2>Featured Destinations</h2>
        <div className="destinations-grid">
          {featuredDestinations.map((destination) => (
            <div key={destination.id} className="destination-card">
              <img src={destination.imageUrl || "/placeholder.svg"} alt={destination.name} />
              <div className="destination-info">
                <h3>{destination.name}</h3>
                <p>{destination.description.substring(0, 100)}...</p>
                <Link to={`/destinations`} className="btn btn-secondary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all">
          <Link to="/destinations" className="btn btn-outline">
            View All Destinations
          </Link>
        </div>
      </section>

      <section className="recent-blogs">
        <h2>Recent Travel Stories</h2>
        <div className="blogs-grid">
          {recentBlogs.map((blog) => (
            <div key={blog.id} className="blog-card">
              <img src={blog.imageUrl || "/placeholder.svg"} alt={blog.title} />
              <div className="blog-info">
                <span className="blog-category">{blog.category}</span>
                <h3>{blog.title}</h3>
                <p>{blog.content.substring(0, 100)}...</p>
                <Link to={`/blogs/${blog.id}`} className="btn btn-text">
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all">
          <Link to="/blogs" className="btn btn-outline">
            View All Blogs
          </Link>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Share Your Travel Experience</h2>
          <p>Join our community and share your amazing travel stories with fellow travelers</p>
          <Link to="/create-blog" className="btn btn-primary">
            Write a Blog
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

