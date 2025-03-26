import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Global Travel Blog</h3>
          <p>Explore the world through our travelers' eyes.</p>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: info@globaltravelblog.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="#" className="social-link">
              Facebook
            </a>
            <a href="#" className="social-link">
              Twitter
            </a>
            <a href="#" className="social-link">
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Global Travel Blog. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

