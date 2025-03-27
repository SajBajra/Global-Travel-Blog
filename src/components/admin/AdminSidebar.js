"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  FaTachometerAlt,
  FaGlobe,
  FaNewspaper,
  FaUsers,
  FaFlag,
  FaChartBar,
  FaTags,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import "./AdminSidebar.css"

const AdminSidebar = () => {
  const location = useLocation()
  const { currentUser, logout } = useContext(AuthContext)
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 576)
      if (window.innerWidth <= 768) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const menuItems = [
    {
      path: "/admin",
      name: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      path: "/admin/destinations",
      name: "Destinations",
      icon: <FaGlobe />,
    },
    {
      path: "/admin/blogs",
      name: "Blogs",
      icon: <FaNewspaper />,
    },
    {
      path: "/admin/users",
      name: "Users",
      icon: <FaUsers />,
    },
    {
      path: "/admin/categories",
      name: "Categories",
      icon: <FaTags />,
    },
    {
      path: "/admin/reports",
      name: "Reports",
      icon: <FaFlag />,
    },
    {
      path: "/admin/analytics",
      name: "Analytics",
      icon: <FaChartBar />,
    },
  ]

  return (
    <>
      {isMobile && (
        <button className="toggle-button" onClick={toggleSidebar}>
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      )}

      <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">{!collapsed && <h2>Admin Panel</h2>}</div>
          {!isMobile && (
            <button className="toggle-button" onClick={toggleSidebar}>
              {collapsed ? <FaBars /> : <FaTimes />}
            </button>
          )}
        </div>

        <div className="admin-profile">
          <img
            src={currentUser?.profilePic || "/default-profile.jpg"}
            alt={currentUser?.name}
            className="admin-avatar"
          />
          {!collapsed && (
            <div className="admin-info">
              <h3>{currentUser?.name}</h3>
              <p>{currentUser?.email}</p>
            </div>
          )}
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item, index) => (
            <li key={index} className={isActive(item.path) ? "active" : ""}>
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                {!collapsed && <span className="text">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <Link to="/" className="view-site">
            <FaHome />
            {!collapsed && <span>View Site</span>}
          </Link>
          <button onClick={logout} className="logout-btn">
            <FaSignOutAlt />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar

