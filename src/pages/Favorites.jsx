import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Star, Users, Heart, Mail, Phone, MapPin, Building2, Globe,
  Home, Tag, MessageSquare,
  ChevronLeft, ChevronRight, X, Trash2, ArrowRight,
} from "lucide-react";
import "./Dashboard.css";
import "./Favorites.css";

const PAGE_SIZE = 8;
const AVATAR_COLORS = [
  ["#f59e0b","#fed7aa"],["#6366f1","#c7d2fe"],["#ec4899","#fce7f3"],
  ["#10b981","#d1fae5"],["#06b6d4","#cffafe"],["#8b5cf6","#e9d5ff"],
  ["#ef4444","#fee2e2"],["#14b8a6","#ccfbf1"],
];

function getInitials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function avatarStyle(id) {
  const [bg, color] = AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
  return { background: bg, color };
}

export default function Favorites() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("favs") || "[]")); }
    catch { return new Set(); }
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        const data = await res.json();
        setUsers(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const toggleFav = useCallback((id) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("favs", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const favUsers = useMemo(() => users.filter(u => favs.has(u.id)), [users, favs]);
  const totalPages = Math.ceil(favUsers.length / PAGE_SIZE);
  const paginated = favUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const sections = [
    { title: "Contact", icon: <Mail size={16} />, items: [
      { label: "Email", value: selected?.email, icon: <Mail size={13} /> },
      { label: "Phone", value: selected?.phone, icon: <Phone size={13} /> },
      { label: "Website", value: selected?.website, icon: <Globe size={13} /> },
    ]},
    { title: "Address", icon: <MapPin size={16} />, items: [
      { label: "Street", value: `${selected?.address?.street || ""} ${selected?.address?.suite || ""}`, icon: <Home size={13} /> },
      { label: "City", value: selected?.address?.city, icon: <Building2 size={13} /> },
      { label: "ZIP", value: selected?.address?.zipcode, icon: <MapPin size={13} /> },
    ]},
    { title: "Company", icon: <Building2 size={16} />, items: [
      { label: "Name", value: selected?.company?.name, icon: <Tag size={13} /> },
      { label: "Catchphrase", value: selected?.company?.catchPhrase, icon: <MessageSquare size={13} /> },
    ]},
  ];

  return (
    <div className="dashboard-enhanced favorites-page">
      <main className="dashboard-main-enhanced">
        <div className="favorites-header">
          <div>
            <h1 className="favorites-heading">Favorites</h1>
            <p className="favorites-subtitle">Your starred user profiles, all in one place</p>
          </div>
        </div>

        {!loading && users.length > 0 && (
          <div className="favorites-stats">
            <div className="favs-stat-card" style={{ "--accent": "#f59e0b" }}>
              <div className="favs-stat-icon"><Star size={22} /></div>
              <div className="favs-stat-body">
                <div className="favs-stat-value">{favUsers.length}</div>
                <div className="favs-stat-label">Favorites</div>
              </div>
              <div className="favs-stat-bar" />
            </div>
            <div className="favs-stat-card" style={{ "--accent": "#6366f1" }}>
              <div className="favs-stat-icon"><Users size={22} /></div>
              <div className="favs-stat-body">
                <div className="favs-stat-value">{users.length}</div>
                <div className="favs-stat-label">Total Users</div>
              </div>
              <div className="favs-stat-bar" />
            </div>
            <div className="favs-stat-card" style={{ "--accent": "#10b981" }}>
              <div className="favs-stat-icon"><Heart size={22} /></div>
              <div className="favs-stat-body">
                <div className="favs-stat-value">{users.length > 0 ? Math.round((favUsers.length / users.length) * 100) : 0}%</div>
                <div className="favs-stat-label">Favorited Rate</div>
              </div>
              <div className="favs-stat-bar" />
            </div>
          </div>
        )}

        <div className="content-area">
          {loading ? (
            <div className="favs-skeleton-grid">
              {[1,2,3,4].map(i => <div key={i} className="favs-skeleton-card" style={{ animationDelay: `${i * 0.08}s` }} />)}
            </div>
          ) : favUsers.length === 0 ? (
            <div className="favs-empty">
              <Star size={56} className="favs-empty-icon" />
              <h3>No favorites yet</h3>
              <p>Go to the Dashboard and click the star icon on user cards to add favorites</p>
            </div>
          ) : (
            <>
              <div className="favs-results-bar">
                <span className="favs-result-count">
                  Showing <strong>{(page - 1) * PAGE_SIZE + 1}</strong>–<strong>{Math.min(page * PAGE_SIZE, favUsers.length)}</strong> of <strong>{favUsers.length}</strong> favorites
                </span>
              </div>

              <div className="favs-grid">
                {paginated.map(user => (
                  <div key={user.id} className="favs-card" onClick={() => setSelected(user)}>
                    <button
                      className="favs-unfav-btn"
                      onClick={e => { e.stopPropagation(); toggleFav(user.id); }}
                      title="Remove from favorites"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="favs-card-top">
                      <div className="favs-avatar" style={avatarStyle(user.id)}>{getInitials(user.name)}</div>
                      <Star size={20} className="favs-star-icon" fill="#f59e0b" color="#f59e0b" />
                    </div>
                    <div className="favs-card-info">
                      <span className="favs-card-name">{user.name}</span>
                      <span className="favs-card-username">@{user.username}</span>
                    </div>
                    <div className="favs-card-details">
                      <div className="favs-card-detail">
                        <Mail size={12} /> <span>{user.email}</span>
                      </div>
                      <div className="favs-card-detail">
                        <Phone size={12} /> <span>{user.phone}</span>
                      </div>
                    </div>
                    <div className="favs-card-footer">
                      <span className="favs-company-badge">{user.company?.name}</span>
                      <span className="favs-view-btn">View <ArrowRight size={12} /></span>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="favs-pagination">
                  <button className="favs-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft size={15} />
                  </button>
                  <div className="favs-page-numbers">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => (
                      <button key={p} className={`favs-page-num ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                  </div>
                  <button className="favs-page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {selected && (
          <div className="modal-overlay-modern" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
            <div className="modal-container-modern favs-modal">
              <button className="modal-close-modern" onClick={() => setSelected(null)}><X size={18} /></button>
              <div className="modal-header-modern">
                <div className="modal-avatar-large" style={avatarStyle(selected.id)}>{getInitials(selected.name)}</div>
                <div className="modal-title-section">
                  <h2>{selected.name}</h2>
                  <p>@{selected.username}</p>
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
              <button className={`modal-favorite-btn active`} onClick={() => { toggleFav(selected.id); setSelected(null); }}>
                <Trash2 size={14} /> Remove from Favorites
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
