import { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import './Layout.css'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true'
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [favCount, setFavCount] = useState(0)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setUserCount(users.length)
    setFavCount(favorites.length)
    setUserName(localStorage.getItem('userName') || localStorage.getItem('userEmail') || '')
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  const openMobile = useCallback(() => setMobileOpen(true), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />
      <div className={`app-layout-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar onMenuToggle={openMobile} userName={userName} userCount={userCount} favCount={favCount} />
        <main className="app-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
