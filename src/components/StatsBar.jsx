import { useState, useEffect, useRef } from 'react'
import './StatsBar.css'

function AnimatedNumber({ value, label, icon, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const counted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const duration = 1000
          const steps = 30
          const step = Math.ceil(value / steps)
          let current = 0
          const timer = setInterval(() => {
            current += step
            if (current >= value) {
              setDisplay(value)
              clearInterval(timer)
            } else {
              setDisplay(current)
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div className="stat-card" ref={ref}>
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">{display}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function StatsBar({ users }) {
  const cities = new Set(users.map((u) => u.address?.city)).size
  const companies = new Set(users.map((u) => u.company?.name)).size

  return (
    <div className="stats-bar">
      <AnimatedNumber value={users.length} label="Total Users" icon="👥" />
      <AnimatedNumber value={cities} label="Cities" icon="📍" />
      <AnimatedNumber value={companies} label="Companies" icon="🏢" />
      <AnimatedNumber value={users.length > 0 ? Math.round(users.reduce((s, u) => s + parseFloat(u.address?.geo?.lat || 0), 0) / users.length * 10) : 0} label="Avg Rating" icon="⭐" suffix="%" />
    </div>
  )
}

export default StatsBar
