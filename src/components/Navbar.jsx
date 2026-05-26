import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ onMenuToggle, userName, userCount, favCount }) {
  const [clock, setClock] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New user registered',
      message: 'John Doe just joined the platform',
      time: '2 min ago',
      read: false,
      type: 'user'
    },
    {
      id: 2,
      title: 'New favorite added',
      message: 'Your note "Project Ideas" was favorited',
      time: '15 min ago',
      read: false,
      type: 'favorite'
    },
    {
      id: 3,
      title: 'System update',
      message: 'System maintenance scheduled for tomorrow',
      time: '1 hour ago',
      read: true,
      type: 'system'
    },
    {
      id: 4,
      title: 'Storage almost full',
      message: 'You have used 85% of your storage',
      time: '3 hours ago',
      read: false,
      type: 'warning'
    }
  ])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = userName || localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Guest'
  const initials = displayName.split('@')[0].split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'G'

  const handleLogout = useCallback(() => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  }, [])

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'user':
        return '👤'
      case 'favorite':
        return '⭐'
      case 'system':
        return '⚙️'
      case 'warning':
        return '⚠️'
      default:
        return '🔔'
    }
  }

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/dashboard/users': 'Users',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/favorites': 'Favorites',
    '/dashboard/settings': 'Settings',
  }

  const pageTitle = Object.entries(pageTitles).find(([path]) => location.pathname === path)?.[1] || 'Dashboard'

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuToggle} title="Toggle menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="navbar-center">
        <div className="navbar-clock">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {clock}
        </div>
        <div className="navbar-stats">
          <div className="navbar-stat">
            <span>👥</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/users')}>{userCount} Users</span>
          </div>
          <div className="navbar-stat">
            <span>⭐</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/favorites')}>{favCount} Favorites</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-notifications-wrapper" ref={notificationRef}>
          <button 
            className="navbar-icon-btn" 
            title="Notifications"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="navbar-badge">{unreadCount}</span>}
          </button>

          {/* Notifications Dropdown */}
          <div className={`navbar-notifications-dropdown ${isNotificationOpen ? 'open' : ''}`}>
            <div className="navbar-notifications-header">
              <span className="navbar-notifications-title">Notifications</span>
              {unreadCount > 0 && (
                <button className="navbar-notifications-mark-all" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="navbar-notifications-list">
              {notifications.length === 0 ? (
                <div className="navbar-notifications-empty">
                  <span>🔔</span>
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`navbar-notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="navbar-notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="navbar-notification-content">
                      <div className="navbar-notification-title">{notification.title}</div>
                      <div className="navbar-notification-message">{notification.message}</div>
                      <div className="navbar-notification-time">{notification.time}</div>
                    </div>
                    <button 
                      className="navbar-notification-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="navbar-notifications-footer">
              <button className="navbar-notifications-view-all">
                View all notifications
              </button>
            </div>
          </div>
        </div>

        <button
          className="navbar-theme-btn"
          onClick={() => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
            const next = isDark ? 'light' : 'dark'
            document.documentElement.setAttribute('data-theme', next)
            localStorage.setItem('theme', next)
          }}
          title="Toggle theme"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <div className="navbar-user-wrapper" ref={dropdownRef}>
          <div className="navbar-user" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className="navbar-user-avatar">{initials}</div>
            <span className="navbar-user-name">{displayName.split('@')[0]}</span>
            <svg className={`navbar-chevron ${isDropdownOpen ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <div className={`navbar-user-dropdown ${isDropdownOpen ? 'open' : ''}`}>
            <div className="navbar-dropdown-header">
              <div className="navbar-dropdown-avatar">{initials}</div>
              <div className="navbar-dropdown-info">
                <span className="navbar-dropdown-name">{displayName.split('@')[0]}</span>
                <span className="navbar-dropdown-email">{displayName.includes('@') ? displayName : `${displayName}@example.com`}</span>
              </div>
            </div>

            <div className="navbar-dropdown-divider" />

            <button onClick={() => {
              navigate('/dashboard/settings')
              setIsDropdownOpen(false)
            }} className="navbar-dropdown-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
              <span className="navbar-dropdown-shortcut">⌘P</span>
            </button>

            <button onClick={() => {
              navigate('/dashboard/analytics')
              setIsDropdownOpen(false)
            }} className="navbar-dropdown-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              Activity Log
            </button>

            <div className="navbar-dropdown-divider" />

            <button className="navbar-dropdown-item danger" onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
              <span className="navbar-dropdown-shortcut">⌘⇧Q</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}