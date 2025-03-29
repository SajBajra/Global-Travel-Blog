import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa"
import { blogUtil, destinationUtil } from "../util"
import "./Home.css"

const Home = () => {
  const [featuredDestinations, setFeaturedDestinations] = useState([])
  const [recentBlogs, setRecentBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured destinations
        const destinationsData = await destinationUtil.getFeaturedDestinations(6)
        setFeaturedDestinations(destinationsData)

        // Fetch recent blogs
        const blogsData = await blogUtil.getAllBlogs("createdAt", "desc")
        setRecentBlogs(blogsData.slice(0, 6))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing destinations...</p>
      </div>
    )
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Explore the World with Global Travel Blog</h1>
          <p>Discover amazing destinations and share your travel experiences</p>
          <div className="hero-buttons">
            <Link to="/destinations" className="btn btn-primary">
              Explore Destinations
            </Link>
            <Link to="/blogs" className="btn btn-outline">
              Read Travel Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="featured-destinations">
        <div className="section-header">
          <h2>Featured Destinations</h2>
          <p>Explore our handpicked destinations from around the world</p>
        </div>
        <div className="destinations-grid">
          {featuredDestinations.map((destination) => (
            <div key={destination.id} className="destination-card">
              <div className="destination-image">
                <img src={destination.imageUrl || "/placeholder.svg"} alt={destination.name} />
                <div className="destination-location">
                  <FaMapMarkerAlt /> {destination.country}
                </div>
              </div>
              <div className="destination-info">
                <h3>{destination.name}</h3>
                <p>{destination.description.substring(0, 100)}...</p>
                <div className="destination-meta">
                  <span>Best time: {destination.bestTimeToVisit}</span>
                </div>
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

      {/* Recent Blogs */}
      <section className="recent-blogs">
        <div className="section-header">
          <h2>Recent Travel Stories</h2>
          <p>Get inspired by our travelers' experiences</p>
        </div>
        <div className="blogs-grid">
          {recentBlogs.map((blog) => (
            <div key={blog.id} className="blog-card">
              <div className="blog-image">
                <img src={blog.imageUrl || "/placeholder.svg"} alt={blog.title} />
                <span className="blog-category">{blog.category}</span>
              </div>
              <div className="blog-info">
                <h3>{blog.title}</h3>
                <div className="blog-meta">
                  <span className="blog-author">By {blog.authorName}</span>
                  <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
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

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Share Your Travel Experience</h2>
          <p>Join our community and share your amazing travel stories with fellow travelers</p>
          <Link to="/create-blog" className="btn btn-primary">
            Write a Blog
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="section-header">
          <h2>Contact Us</h2>
          <p>Get in touch with our travel experts</p>
        </div>

        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-card">
              <FaMapMarkerAlt className="contact-icon" />
              <h3>Our Location</h3>
              <p>Chapagaun, Lalitpur, Nepal</p>
            </div>

            <div className="contact-card">
              <FaPhone className="contact-icon" />
              <h3>Phone Number</h3>
              <p>+977 1234567890</p>
            </div>

            <div className="contact-card">
              <FaEnvelope className="contact-icon" />
              <h3>Email Address</h3>
              <p>info@globaltravelblog.com</p>
            </div>
          </div>

          <div className="contact-map">
         <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.082888785083!2d85.3605289744873!3d27.63374897653808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1f70aea9b197%3A0x732b3f2c75183159!2sChapagaun%2C%20Lalitpur!5e0!3m2!1sen!2snp!4v1711741558917!5m2!1sen!2snp"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Map of Chapagaun Lalitpur"
          ></iframe>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

