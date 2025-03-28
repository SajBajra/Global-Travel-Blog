import { useState, useContext, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router"
import { AuthContext } from "../context/AuthContext"
import { FaBars, FaTimes, FaChevronDown, FaSignOutAlt, FaUser, FaPen, FaCog } from "react-icons/fa"
import "./Navbar.css"

const Navbar = () => {
  const { currentUser, isAdmin, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const toggleProfile = () => {
    setProfileOpen(!profileOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Global Travel Blog
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/destinations" className={`nav-link ${isActive("/destinations") ? "active" : ""}`}>
              Destinations
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/blogs" className={`nav-link ${isActive("/blogs") ? "active" : ""}`}>
              Blogs
            </Link>
          </li>

          {currentUser && (
            <li className="nav-item mobile-only">
              <Link to="/create-blog" className={`nav-link ${isActive("/create-blog") ? "active" : ""}`}>
                Write Blog
              </Link>
            </li>
          )}

          {currentUser && (
            <li className="nav-item mobile-only">
              <Link to="/profile" className={`nav-link ${isActive("/profile") ? "active" : ""}`}>
                Profile
              </Link>
            </li>
          )}

          {isAdmin && (
            <li className="nav-item mobile-only">
              <Link to="/admin" className={`nav-link admin-link ${isActive("/admin") ? "active" : ""}`}>
                Admin
              </Link>
            </li>
          )}

          {currentUser ? (
            <li className="nav-item mobile-only">
            </li>
          ) : (
            <li className="nav-item mobile-only">
              <Link to="/login" className={`nav-link ${isActive("/login") ? "active" : ""}`}>
                Login
              </Link>
            </li>
          )}
        </ul>

        {currentUser ? (
          <div className="profile-menu-container">
            {currentUser && (
              <Link to="/create-blog" className="write-blog-btn desktop-only">
                <FaPen /> Write
              </Link>
            )}
            <div className="profile-menu">
              <div className="profile-trigger" onClick={toggleProfile}>
                <img
                  src={currentUser.profilePic || "/default-profile.jpg"}
                  alt={currentUser.name}
                  className="profile-avatar"
                />
                <FaChevronDown className="dropdown-icon" />
              </div>
              <div className={`profile-dropdown ${profileOpen ? "show" : ""}`}>
                <div className="profile-header">
                  <img
                    src={currentUser.profilePic || "/default-profile.jpg"}
                    alt={currentUser.name}
                    className="dropdown-avatar"
                  />
                  <div className="profile-info">
                    <h4>{currentUser.name}</h4>
                    <p>{currentUser.email}</p>
                  </div>
                </div>
                <div className="profile-menu-items">
                  <Link to="/profile" className="profile-menu-item">
                    <FaUser /> My Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="profile-menu-item">
                      <FaCog /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="profile-menu-item logout">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/login" className="login-btn desktop-only">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar

