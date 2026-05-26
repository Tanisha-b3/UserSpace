import { useState, useEffect, useMemo } from "react";
import {
  Users as UsersIcon, Building2, Globe, Search, ChevronLeft, ChevronRight,
  X, Mail, Phone, Globe as WebIcon, Home, MapPin, Tag, MessageSquare,
  Briefcase, User, ArrowUpDown, ArrowUp, ArrowDown,
  Eye, Filter,
} from "lucide-react";
import "./Dashboard.css";
import "./Users.css";

const PAGE_SIZE = 10;
const AVATAR_COLORS = [
  ["#6366f1","#c7d2fe"],["#06b6d4","#cffafe"],["#f59e0b","#fed7aa"],
  ["#ec4899","#fce7f3"],["#10b981","#d1fae5"],["#8b5cf6","#e9d5ff"],
  ["#ef4444","#fee2e2"],["#14b8a6","#ccfbf1"],
];

function getInitials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function avatarStyle(id) {
  const [bg, color] = AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
  return { background: bg, color };
}

function StatCard({ stat }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const end = typeof stat.value === "number" ? stat.value : 0;
    if (!end) return;
    let start = 0;
    const step = Math.ceil(end / 25);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [stat.value]);

  return (
    <div className="users-stat-card" style={{ "--accent": stat.color }}>
      <div className="users-stat-icon">{stat.icon}</div>
      <div className="users-stat-body">
        <div className="users-stat-value">{typeof stat.value === "number" ? count.toLocaleString() : stat.value}</div>
        <div className="users-stat-label">{stat.label}</div>
      </div>
      <div className="users-stat-bar" />
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        const data = await res.json();
        setUsers(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.company?.name?.toLowerCase().includes(q)
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    result.sort((a, b) => {
      const getVal = (u) => {
        if (sortField === "company") return (u.company?.name || "").toLowerCase();
        if (sortField === "city") return (u.address?.city || "").toLowerCase();
        return (u[sortField] || "").toLowerCase();
      };
      return getVal(a) < getVal(b) ? -dir : getVal(a) > getVal(b) ? dir : 0;
    });
    return result;
  }, [users, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalCompanies = new Set(users.map(u => u.company?.name)).size;
  const totalCities = new Set(users.map(u => u.address?.city)).size;

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  };

  const SortIcon = sortDir === "asc" ? ArrowUp : ArrowDown;

  const cols = [
    { key: "name", label: "User", icon: <User size={13} /> },
    { key: "email", label: "Email", icon: <Mail size={13} /> },
    { key: "phone", label: "Phone", icon: <Phone size={13} /> },
    { key: "company", label: "Company", icon: <Building2 size={13} /> },
    { key: "city", label: "City", icon: <MapPin size={13} /> },
  ];

  const statData = [
    { label: "Total Users", value: users.length, icon: <UsersIcon size={22} />, color: "#6366f1" },
    { label: "Companies", value: totalCompanies, icon: <Building2 size={22} />, color: "#10b981" },
    { label: "Cities", value: totalCities, icon: <Globe size={22} />, color: "#06b6d4" },
  ];

  const sections = [
    { title: "Contact", icon: <Mail size={16} />, items: [
      { label: "Email", value: selected?.email, icon: <Mail size={13} /> },
      { label: "Phone", value: selected?.phone, icon: <Phone size={13} /> },
      { label: "Website", value: selected?.website, icon: <WebIcon size={13} /> },
    ]},
    { title: "Address", icon: <MapPin size={16} />, items: [
      { label: "Street", value: `${selected?.address?.street || ""} ${selected?.address?.suite || ""}`, icon: <Home size={13} /> },
      { label: "City", value: selected?.address?.city, icon: <Building2 size={13} /> },
      { label: "ZIP", value: selected?.address?.zipcode, icon: <MapPin size={13} /> },
    ]},
    { title: "Company", icon: <Building2 size={16} />, items: [
      { label: "Name", value: selected?.company?.name, icon: <Tag size={13} /> },
      { label: "Catchphrase", value: selected?.company?.catchPhrase, icon: <MessageSquare size={13} /> },
      { label: "Business", value: selected?.company?.bs, icon: <Briefcase size={13} /> },
    ]},
  ];

  return (
    <div className="dashboard-enhanced users-page">
      <main className="dashboard-main-enhanced">
        <div className="users-page-header">
          <div>
            <h1 className="users-heading">Users</h1>
            <p className="users-subtitle">Manage and explore user profiles across your organization</p>
          </div>
        </div>

        {!loading && users.length > 0 && (
          <div className="users-stat-grid">
            {statData.map(s => <StatCard key={s.label} stat={s} />)}
          </div>
        )}

        <div className="users-controls">
          <div className="users-search-wrap">
            <Search size={16} className="users-search-icon" />
            <input
              className="users-search-input"
              type="text"
              placeholder="Search by name, email, company…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button className="users-search-clear" onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="users-view-toggle">
            <button
              className={`users-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <button
              className={`users-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="content-area">
          {loading ? (
            <div className="users-skeleton">
              <div className="users-skeleton-rows">
                {[1,2,3,4,5].map(i => <div key={i} className="users-skeleton-row" style={{ animationDelay: `${i * 0.06}s` }} />)}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="users-empty">
              <Search size={48} className="users-empty-icon" />
              <h3>No users found</h3>
              <p>Try adjusting your search</p>
              {search && <button className="users-empty-btn" onClick={() => setSearch("")}>Clear search</button>}
            </div>
          ) : viewMode === "table" ? (
            <>
              <div className="users-results-bar">
                <span className="users-result-count">
                  Showing <strong>{(page - 1) * PAGE_SIZE + 1}</strong>–<strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> users
                </span>
                {search && <span className="users-filter-badge"><Filter size={12} /> Filtered</span>}
              </div>

              <div className="users-table-wrap">
                <table className="users-table">
                  <thead>
                    <tr>
                      {cols.map(c => (
                        <th key={c.key} onClick={() => handleSort(c.key)} className={sortField === c.key ? "sorted" : ""}>
                          <span className="users-th-content">
                            {c.icon} {c.label}
                            {sortField === c.key ? <SortIcon size={12} className="users-sort-active" /> : <ArrowUpDown size={12} className="users-sort-idle" />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(u => (
                      <tr key={u.id} className="users-row" onClick={() => setSelected(u)}>
                        <td className="users-cell-name">
                          <div className="users-avatar" style={avatarStyle(u.id)}>{getInitials(u.name)}</div>
                          <div className="users-cell-info">
                            <span className="users-cell-name-text">{u.name}</span>
                            <span className="users-cell-username">@{u.username}</span>
                          </div>
                        </td>
                        <td className="users-cell-email">
                          <span>{u.email}</span>
                        </td>
                        <td className="users-cell-phone">{u.phone}</td>
                        <td className="users-cell-company">
                          <span className="users-company-badge">{u.company?.name}</span>
                        </td>
                        <td className="users-cell-city">
                          <MapPin size={12} className="users-city-icon" /> {u.address?.city}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="users-pagination">
                  <button className="users-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft size={15} />
                  </button>
                  <div className="users-page-numbers">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => (
                      <button key={p} className={`users-page-num ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                  </div>
                  <button className="users-page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="users-results-bar">
                <span className="users-result-count">
                  Showing <strong>{(page - 1) * PAGE_SIZE + 1}</strong>–<strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> users
                </span>
              </div>
              <div className="users-grid">
                {paginated.map(u => (
                  <div key={u.id} className="users-grid-card" onClick={() => setSelected(u)}>
                    <div className="users-grid-avatar" style={avatarStyle(u.id)}>{getInitials(u.name)}</div>
                    <div className="users-grid-info">
                      <span className="users-grid-name">{u.name}</span>
                      <span className="users-grid-username">@{u.username}</span>
                    </div>
                    <div className="users-grid-details">
                      <div className="users-grid-detail">
                        <Mail size={12} /> <span>{u.email}</span>
                      </div>
                      <div className="users-grid-detail">
                        <Building2 size={12} /> <span>{u.company?.name}</span>
                      </div>
                      <div className="users-grid-detail">
                        <MapPin size={12} /> <span>{u.address?.city}</span>
                      </div>
                    </div>
                    <div className="users-grid-footer">
                      <span className="users-grid-view"><Eye size={12} /> View Profile</span>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="users-pagination">
                  <button className="users-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft size={15} />
                  </button>
                  <div className="users-page-numbers">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => (
                      <button key={p} className={`users-page-num ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                  </div>
                  <button className="users-page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {selected && (
          <div className="modal-overlay-modern" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
            <div className="modal-container-modern users-modal">
              <button className="modal-close-modern" onClick={() => setSelected(null)}><X size={18} /></button>
              <div className="modal-header-modern">
                <div className="modal-avatar-large" style={avatarStyle(selected.id)}>{getInitials(selected.name)}</div>
                <div className="modal-title-section">
                  <h2>{selected.name}</h2>
                  <p>@{selected.username}</p>
                  <span className="users-modal-website"><WebIcon size={12} /> {selected.website}</span>
                </div>
              </div>
              {sections.map((s, i) => (
                <div key={i} className="modal-section-modern">
                  <div className="section-header"><span className="section-icon">{s.icon}</span><h3>{s.title}</h3></div>
                  <div className="section-content">
                    {s.items.map((item, j) => (
                      <div key={j} className="info-row">
                        <span className="info-label"><span className="info-icon">{item.icon}</span>{item.label}</span>
                        <span className="info-value">{item.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
