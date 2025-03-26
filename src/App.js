import { BrowserRouter as Router, Routes, Route } from "react-router"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "antd/dist/reset.css" 
import "./App.css"

// Components
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"

// Pages
import Home from "./pages/Home"
import Destinations from "./pages/Destinations"
import Blogs from "./pages/Blogs"
import SingleBlog from "./pages/SingleBlog" // Import the new SingleBlog component
import CreateBlog from "./pages/CreateBlog"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import AdminPanel from "./pages/AdminPanel"
import ManageDestinations from "./pages/admin/ManageDestinations"
import ManageBlogs from "./pages/admin/ManageBlogs"
import ManageUsers from "./pages/admin/ManageUsers"

// Context
import { AuthProvider } from "./context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:id" element={<SingleBlog />} /> {/* Add the new route */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Protected Routes (User) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/create-blog" element={<CreateBlog />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/destinations" element={<ManageDestinations />} />
                <Route path="/admin/blogs" element={<ManageBlogs />} />
                <Route path="/admin/users" element={<ManageUsers />} />
              </Route>
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

