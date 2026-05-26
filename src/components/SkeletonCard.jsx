import './SkeletonCard.css'

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-avatar" />
      <div className="skeleton-line skeleton-name" />
      <div className="skeleton-line skeleton-username" />
      <div className="skeleton-details">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    </div>
  )
}

function SkeletonCards({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  )
}

export default SkeletonCards
