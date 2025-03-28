import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { blogUtil } from "../util"
import "./Profile.css"

const Profile = () => {
  const { currentUser, updateProfile, uploadProfilePicture } = useContext(AuthContext)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  })

  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
      })

      // Fetch user's blogs
      const fetchUserBlogs = async () => {
        try {
          const userBlogs = await blogUtil.getBlogsByAuthor(currentUser.id)
          setBlogs(userBlogs)
        } catch (error) {
          console.error("Error fetching user blogs:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchUserBlogs()
    }
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      await updateProfile(formData)
    } finally {
      setUpdating(false)
    }
  }

  const handleProfilePicture = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        await uploadProfilePicture(file)
      } catch (error) {
        console.error("Error uploading profile picture:", error)
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-picture-container">
            <img
              src={currentUser.profilePic || "/default-profile.jpg"}
              alt={currentUser.name}
              className="profile-picture"
            />
            <div className="profile-picture-upload">
              <label htmlFor="profile-pic" className="upload-label">
                Change Picture
              </label>
              <input
                type="file"
                id="profile-pic"
                accept="image/*"
                onChange={handleProfilePicture}
                className="upload-input"
              />
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{blogs.length}</span>
              <span className="stat-label">Blogs</span>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Personal Information</h2>
            <form className="profile-form" onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>

          <div className="profile-section">
            <h2>My Blogs</h2>
            {blogs.length > 0 ? (
              <div className="user-blogs">
                {blogs.map((blog) => (
                  <div key={blog.id} className="blog-item">
                    <div className="blog-item-image">
                      <img src={blog.imageUrl || "/placeholder.svg"} alt={blog.title} />
                    </div>
                    <div className="blog-item-content">
                      <h3>{blog.title}</h3>
                      <div className="blog-item-meta">
                        <span className="blog-category">{blog.category}</span>
                        <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p>{blog.content.substring(0, 100)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-blogs">
                <p>You haven't written any blogs yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

