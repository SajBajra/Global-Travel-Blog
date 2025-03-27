import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "antd/dist/reset.css"
import "./App.css"

// Components
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import AdminLayout from "./components/admin/AdminLayout"

// Pages
import Home from "./pages/Home"
import Destinations from "./pages/Destinations"
import Blogs from "./pages/Blogs"
import SingleBlog from "./pages/SingleBlog"
import CreateBlog from "./pages/CreateBlog"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import AdminPanel from "./pages/AdminPanel"
import ManageDestinations from "./pages/admin/ManageDestinations"
import ManageBlogs from "./pages/admin/ManageBlogs"
import ManageUsers from "./pages/admin/ManageUsers"
import ManageCategories from "./pages/admin/ManageCategories"
import ManageReports from "./pages/admin/ManageReports"
import Analytics from "./pages/admin/Analytics"


// Context
import { AuthProvider } from "./context/AuthContext"

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    )
}

function AppContent() {
    const location = useLocation()
    const isAdminRoute = location.pathname.startsWith("/admin")

    return (
        <div className="app">
            {!isAdminRoute && <Navbar />}
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
                    {/* Admin Routes with AdminLayout */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminPanel />} />
                            <Route path="destinations" element={<ManageDestinations />} />
                            <Route path="blogs" element={<ManageBlogs />} />
                            <Route path="users" element={<ManageUsers />} />
                            <Route path="categories" element={<ManageCategories />} />
                            <Route path="reports" element={<ManageReports />} />
                            <Route path="analytics" element={<Analytics />} />
                        </Route>
                    </Route>
                </Routes>
            </main>
            {!isAdminRoute && <Footer />}
            <ToastContainer position="bottom-right" />
        </div>
    )
}

export default App