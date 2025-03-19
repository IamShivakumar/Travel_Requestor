import React from 'react'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import TravelRegister from './pages/Users/TravelRegister'
import RequestsListing from './pages/Admin/RequestsListing'
import RequestDetail from './pages/Admin/RequestDetail'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AppRoutes = () => {
    const {isLoggedIn} = useSelector((state) => state.userInfo);
    const is_admin = localStorage.getItem("is_adminUser") === "true";

  return (
    <BrowserRouter>
      <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              {/* Role-Based Redirects */}
              {is_admin && (
                <>
                  <Route path="/RequestListing" element={<RequestsListing />} />
                  <Route path="/requests/:id" element={<RequestDetail />} />
                  <Route path="/*" element={<Navigate to="/RequestListing" />} />
                </>
              )}

              {!is_admin && (
                <>
                  <Route path="/TravelRegister" element={<TravelRegister />} />
                  <Route path="/*" element={<Navigate to="/TravelRegister" />} />
                </>
              )}
            </>
          )}
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes