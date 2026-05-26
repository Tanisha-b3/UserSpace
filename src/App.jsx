import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Analytics from './pages/Analytics'
import Favorites from './pages/Favorites'
import Settings from './pages/Settings'

function RequireAuth({ children }) {
  return localStorage.getItem('isLoggedIn') ? children : <Navigate to="/" replace />
}

function GuestRoute({ children }) {
  return localStorage.getItem('isLoggedIn') ? <Navigate to="/dashboard" replace /> : children
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (!users.find((u) => u.email === 'demo@example.com')) {
      users.unshift({ name: 'Demo User', email: 'demo@example.com', password: 'demo123' })
      localStorage.setItem('users', JSON.stringify(users))
    }
  }, [])

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/favorites" element={<Favorites />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}

export default App
