import { useState } from 'react'
import './App.css'
import { ToastContainer } from 'react-toastify'
import AppRoutes from './AppRoutes'

function App() {

  return (
    <>
      <ToastContainer />
      <AppRoutes/>
    </>
  )
}

export default App
