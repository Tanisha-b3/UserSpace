import { useState, useCallback } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]')
    } catch {
      return []
    }
  })

  const toggleFavorite = useCallback((userId) => {
    setFavorites((prev) => {
      const next = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
      localStorage.setItem('favorites', JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((userId) => favorites.includes(userId), [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
