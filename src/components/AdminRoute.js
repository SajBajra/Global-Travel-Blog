"use client"

import { useContext } from "react"
import { Navigate, Outlet } from "react-router"
import { AuthContext } from "../context/AuthContext"

const AdminRoute = () => {
  const { currentUser, isAdmin, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return currentUser && isAdmin ? <Outlet /> : <Navigate to="/" />
}

export default AdminRoute

