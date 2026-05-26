import './UserDetail.css'

function UserDetail({ user, onClose }) {
  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <div className="detail-overlay" onClick={onClose} />
      <div className="detail-panel">
        <div className="detail-header">
          <h2>User Profile</h2>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>
        <div className="detail-body">
          <div className="detail-avatar">{initials}</div>
          <h3 className="detail-name">{user.name}</h3>
          <p className="detail-username">@{user.username}</p>

          <div className="detail-section">
            <h3>Contact</h3>
            <div className="detail-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>{user.email.toLowerCase()}</span>
            </div>
            <div className="detail-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{user.phone}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Address</h3>
            <div className="detail-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{user.address.street}, {user.address.suite}</span>
            </div>
            <div className="detail-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{user.address.city}, {user.address.zipcode}</span>
            </div>
            {user.address.geo && (
              <div className="detail-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <a href={`https://maps.google.com/?q=${user.address.geo.lat},${user.address.geo.lng}`} target="_blank" rel="noopener noreferrer">
                  {user.address.geo.lat}, {user.address.geo.lng}
                </a>
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>Company</h3>
            <div className="detail-company">
              <p><strong>{user.company.name}</strong></p>
              <p>{user.company.catchPhrase}</p>
              <p>{user.company.bs}</p>
            </div>
          </div>

          <div className="detail-section">
            <h3>Links</h3>
            <div className="detail-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer">{user.website}</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserDetail
