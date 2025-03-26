"use client"

import { useContext } from "react"
import { Navigate, Outlet } from "react-router"
import { AuthContext } from "../context/AuthContext"

const ProtectedRoute = () => {
  const { currentUser, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoute

