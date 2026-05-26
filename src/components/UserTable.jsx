import './UserTable.css'

function UserTable({ users, onSelect, sortField, sortDirection, onSort }) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    { key: 'company', label: 'Company' },
    { key: 'website', label: 'Website' },
  ]

  return (
    <div className="table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`sortable ${sortField === col.key ? `sorted-${sortDirection}` : ''}`}
                onClick={() => onSort?.(col.key)}
              >
                {col.label}
                <span className="sort-indicator">
                  {sortField === col.key ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} onClick={() => onSelect?.(user)}>
              <td data-label="Name">{user.name}</td>
              <td data-label="Username">@{user.username}</td>
              <td data-label="Email">{user.email.toLowerCase()}</td>
              <td data-label="Phone">{user.phone}</td>
              <td data-label="City">{user.address?.city}</td>
              <td data-label="Company">{user.company?.name}</td>
              <td data-label="Website">
                <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  {user.website}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
