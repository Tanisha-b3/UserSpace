import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Users, Star, Building2, Globe, Search, RefreshCw, Download, ChevronLeft, ChevronRight, Grid3X3, List, Check, X, AlertTriangle, Info, FileText, Clipboard, GripVertical, ArrowRight, MapPin, Phone, Mail, Home, Tag, MessageSquare, Briefcase, Save, Pencil, Keyboard, Target, User, TrendingUp } from "lucide-react";
import "./Dashboard.css";

const PAGE_SIZE = 8;

/* ── Helper Hooks ──────────────────────────────────────────── */
function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("favs") || "[]")); }
    catch { return new Set(); }
  });
  const toggle = useCallback((id) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("favs", JSON.stringify([...next]));
      return next;
    });
  }, []);
  return { isFav: (id) => favs.has(id), toggle, count: favs.size };
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

function getInitials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  ["#6366f1","#c7d2fe"],["#06b6d4","#cffafe"],["#f59e0b","#fed7aa"],
  ["#ec4899","#fce7f3"],["#10b981","#d1fae5"],["#8b5cf6","#e9d5ff"],
  ["#ef4444","#fee2e2"],["#14b8a6","#ccfbf1"],["#f97316","#ffedd5"],["#0ea5e9","#e0f2fe"],
];

function avatarStyle(id) {
  const [bg, color] = AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
  return { background: bg, color };
}

/* ── Toast System ─────────────────────────────────────────── */
let toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = ++toastId;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, add };
}



/* ── User Profile Edit Modal ──────────────────────────────── */
function ProfileEditModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    website: user.website || "",
    city: user.address?.city || "",
    company: user.company?.name || "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    onSave({ ...user, name: form.name, email: form.email, phone: form.phone, website: form.website,
      address: { ...user.address, city: form.city },
      company: { ...user.company, name: form.company } });
    setSaving(false);
    onClose();
  };

  const fields = [
    { key: "name", label: "Full Name", icon: <User size={14} />, type: "text" },
    { key: "email", label: "Email Address", icon: <Mail size={14} />, type: "email" },
    { key: "phone", label: "Phone Number", icon: <Phone size={14} />, type: "text" },
    { key: "website", label: "Website", icon: <Globe size={14} />, type: "text" },
    { key: "city", label: "City", icon: <MapPin size={14} />, type: "text" },
    { key: "company", label: "Company", icon: <Building2 size={14} />, type: "text" },
  ];

  return (
    <div className="modal-overlay-modern" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container-modern profile-edit-modal">
        <div className="modal-edit-header">
          <div className="modal-avatar-large" style={avatarStyle(user.id)}>{getInitials(user.name)}</div>
          <div>
            <h2>Edit Profile</h2>
            <p className="modal-edit-sub">@{user.username}</p>
          </div>
          <button className="modal-close-modern" onClick={onClose}>✕</button>
        </div>

        <div className="profile-edit-fields">
          {fields.map(f => (
            <div key={f.key} className={`edit-field-group ${errors[f.key] ? "has-error" : ""}`}>
              <label className="edit-label"><span>{f.icon}</span> {f.label}</label>
              <input
                className="edit-input"
                type={f.type}
                value={form[f.key]}
                onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: "" })); }}
              />
              {errors[f.key] && <span className="edit-error">{errors[f.key]}</span>}
            </div>
          ))}
        </div>

        <div className="profile-edit-actions">
          <button className="edit-cancel-btn" onClick={onClose}>Cancel</button>
          <button className={`edit-save-btn ${saving ? "saving" : ""}`} onClick={handleSave} disabled={saving}>
            {saving ? <span className="btn-spinner"></span> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tag Filter Input ─────────────────────────────────────── */
function TagFilterInput({ tags, onAdd, onRemove, placeholder, options }) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef(null);

  const filtered = options.filter(o => o.toLowerCase().includes(input.toLowerCase()) && !tags.includes(o));

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setShowDropdown(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="tag-filter-wrapper" ref={ref}>
      <div className="tag-filter-box" onClick={() => setShowDropdown(true)}>
        {tags.map(t => (
          <span key={t} className="tag-chip">
            {t}
            <button onClick={e => { e.stopPropagation(); onRemove(t); }} className="tag-remove">✕</button>
          </span>
        ))}
        <input
          className="tag-filter-input"
          value={input}
          onChange={e => { setInput(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>
      {showDropdown && filtered.length > 0 && (
        <div className="tag-dropdown">
          {filtered.map(o => (
            <div key={o} className="tag-option" onClick={() => { onAdd(o); setInput(""); setShowDropdown(false); }}>
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Enhanced Charts ──────────────────────────────────────── */
function DonutChart({ data, colors, title, badge }) {
  const total = data.reduce((s, [, v]) => s + v, 0);
  const [hovered, setHovered] = useState(null);

  const slices = data.reduce((acc, [label, value], i) => {
    const pct = value / total;
    const startAngle = acc.cum * 360;
    const newCum = acc.cum + pct;
    const endAngle = newCum * 360;
    const large = endAngle - startAngle > 180 ? 1 : 0;
    const r = 80;
    const cx = 100, cy = 100;
    const toRad = a => (a - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    acc.result.push({ label, value, pct, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: colors[i % colors.length] });
    acc.cum = newCum;
    return acc;
  }, { cum: 0, result: [] }).result;

  const active = hovered !== null ? slices[hovered] : null;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title-with-icon">{title}</h3>
        <span className="chart-badge">{badge}</span>
      </div>
      <div className="donut-container">
        <div className="donut-svg-wrap">
          <svg viewBox="0 0 200 200" className="donut-svg">
            {slices.map((s, i) => (
              <path key={i} d={s.path} fill={s.color}
                className={`donut-slice ${hovered === i ? "hovered" : ""}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ transform: hovered === i ? "scale(1.05)" : "scale(1)", transformOrigin: "100px 100px" }}
              />
            ))}
            <circle cx="100" cy="100" r="52" fill="var(--bg-secondary)" />
          </svg>
          <div className="donut-center">
            {active ? (
              <>
                <span className="donut-val">{active.value}</span>
                <span className="donut-lbl" style={{ fontSize: "0.55rem", color: active.color }}>{active.label}</span>
              </>
            ) : (
              <>
                <span className="donut-val">{total}</span>
                <span className="donut-lbl">Total</span>
              </>
            )}
          </div>
        </div>
        <div className="donut-legend">
          {slices.map((s, i) => (
            <div key={i} className={`donut-legend-item ${hovered === i ? "highlighted" : ""}`}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <span className="donut-legend-dot" style={{ background: s.color }}></span>
              <span className="donut-legend-label">{s.label}</span>
              <span className="donut-legend-pct">{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AreaChart({ users, favorites }) {
  const [period, setPeriod] = useState("week");
  const days = period === "week" ? 7 : 30;

  const data = useMemo(() => Array.from({ length: days }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (days - i - 1));
    return {
      day: date.toLocaleDateString("en-US", { weekday: period === "week" ? "short" : undefined, day: period === "month" ? "numeric" : undefined }),
      logins: Math.floor(((i + 1) * 13 % Math.max(users.length, 1)) * 1.5) + 5,
      favs: Math.max(1, Math.floor(((i + 1) * 7 % Math.max(favorites + 1, 2)) / 2) + 1),
    };
  }), [users, favorites, days, period]);

  const maxV = Math.max(...data.flatMap(d => [d.logins, d.favs]));
  const W = data.length * 48;
  const H = 180;
  const toY = v => H - (v / maxV) * (H - 20) - 10;

  const polyPoints = (key) => data.map((d, i) => `${i * 48 + 24},${toY(d[key])}`).join(" ");
  const areaPath = (key) => {
    const pts = data.map((d, i) => `${i * 48 + 24},${toY(d[key])}`);
    return `M ${pts[0]} ${pts.slice(1).map(p => "L " + p).join(" ")} L ${(data.length - 1) * 48 + 24},${H} L 24,${H} Z`;
  };

  return (
    <div className="chart-card chart-area-card">
      <div className="chart-header">
        <h3><TrendingUp size={18} /> Activity Trends</h3>
        <div className="chart-period-selector">
          {["week", "month"].map(p => (
            <button key={p} className={`period-btn ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="area-chart-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="area-svg" style={{ minWidth: W }}>
          <defs>
            <linearGradient id="grad-logins" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad-favs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1="0" y1={toY(maxV * f)} x2={W} y2={toY(maxV * f)} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          <path d={areaPath("logins")} fill="url(#grad-logins)" className="area-fill" />
          <path d={areaPath("favs")} fill="url(#grad-favs)" className="area-fill" />
          <polyline points={polyPoints("logins")} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="area-line" />
          <polyline points={polyPoints("favs")} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="area-line" />
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={i * 48 + 24} cy={toY(d.logins)} r="4" fill="var(--bg-secondary)" stroke="#6366f1" strokeWidth="2" className="area-dot" />
              <circle cx={i * 48 + 24} cy={toY(d.favs)} r="4" fill="var(--bg-secondary)" stroke="#f59e0b" strokeWidth="2" className="area-dot" />
              {period === "week" && (
                <text x={i * 48 + 24} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{d.day}</text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="chart-legend">
        <div className="legend-dot"><div className="dot" style={{ background: "#6366f1" }} /><span>Logins</span></div>
        <div className="legend-dot"><div className="dot" style={{ background: "#f59e0b" }} /><span>Favorites</span></div>
      </div>
    </div>
  );
}

function StatCard({ stat, idx }) {
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const end = typeof stat.value === "number" ? stat.value : 0;
    if (end === 0) return;
    let start = 0;
    const step = Math.ceil(end / 30);
    timerRef.current = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timerRef.current); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timerRef.current);
  }, [stat.value]);

  return (
    <div className="stat-card-premium" style={{ animationDelay: `${idx * 0.08}s` }}>
      <div className="stat-card-inner">
        <div className="stat-icon-wrapper" style={{ background: stat.gradient }}>
          <span>{stat.icon}</span>
        </div>
        <div className="stat-content">
          <div className="stat-value">{typeof stat.value === "number" ? count.toLocaleString() : stat.value}</div>
          <div className="stat-label">{stat.label}</div>
          <div className="stat-change">{stat.change}</div>
        </div>
      </div>
      <div className="stat-progress-bar" style={{ background: stat.gradient }} />
    </div>
  );
}

/* ── Drag-and-Drop User Cards ─────────────────────────────── */
function DraggableUserCard({ user, onSelect, isFav, onToggleFav, index, onDragStart, onDragOver, onDrop, isDraggingOver }) {
  const st = avatarStyle(user.id);
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      className={`user-card-modern ${isDraggingOver ? "drag-over" : ""}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index); }}
      onDrop={() => onDrop(index)}
      onClick={() => onSelect(user)}
    >
      <div className="drag-handle" title="Drag to reorder"><GripVertical size={14} /></div>
      <div className="card-header">
        <div className="user-avatar-modern" style={st}>{getInitials(user.name)}</div>
        <button className={`favorite-btn-modern ${isFav ? "active" : ""}`}
          onClick={e => { e.stopPropagation(); onToggleFav(user.id); }}
          title={isFav ? "Remove from favorites" : "Add to favorites"}>
          <Star size={16} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="user-info">
        <h3 className="user-name">{user.name}</h3>
        <span className="user-username">@{user.username}</span>
      </div>
      <div className="user-details">
        <div className="detail-item">
          <Mail size={13} />
          <span>{user.email}</span>
        </div>
        <div className="detail-item">
          <Phone size={13} />
          <span>{user.phone}</span>
        </div>
        <div className="detail-item">
          <MapPin size={13} />
          <span>{user.address?.city}</span>
        </div>
      </div>
      <div className="card-footer">
        <span className="company-badge">{user.company?.name}</span>
        <button className="view-details-btn" onClick={e => { e.stopPropagation(); onSelect(user); }}>
          View <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── User Table ───────────────────────────────────────────── */
function UserTable({ users, onSelect, sortField, sortDir, onSort }) {
  const cols = [
    { key: "name", label: "User", icon: <User size={13} /> },
    { key: "email", label: "Email", icon: <Mail size={13} /> },
    { key: "phone", label: "Phone", icon: <Phone size={13} /> },
    { key: "city", label: "Location", icon: <MapPin size={13} /> },
    { key: "company", label: "Company", icon: <Building2 size={13} /> },
  ];
  return (
    <div className="table-container-modern">
      <table className="modern-table">
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} onClick={() => onSort(c.key)} className={sortField === c.key ? "sorted" : ""}>
                <span className="th-content">
                  <span className="th-icon">{c.icon}</span>{c.label}
                  {sortField === c.key && <span className="sort-indicator">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="table-row-modern">
              <td className="user-cell" onClick={() => onSelect(u)}>
                <div className="user-avatar-small" style={avatarStyle(u.id)}>{getInitials(u.name)}</div>
                <span className="user-name-cell">{u.name}</span>
              </td>
              <td className="email-cell">{u.email}</td>
              <td className="phone-cell">{u.phone}</td>
              <td className="location-cell">{u.address?.city}</td>
              <td className="company-cell"><span className="company-badge-sm">{u.company?.name}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Pagination ───────────────────────────────────────────── */
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= 2) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return (
    <div className="pagination-modern">
      <button className="page-btn" disabled={current === 1} onClick={() => onChange(current - 1)}>
        <ChevronLeft size={14} />
      </button>
      {pages.map((p, i) =>
        p === "..." ? <span key={i} className="page-dots">…</span> :
          <button key={p} className={`page-btn ${p === current ? "active" : ""}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="page-btn" disabled={current === total} onClick={() => onChange(current + 1)}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* ── User Detail Modal ────────────────────────────────────── */
function UserDetail({ user, isFav, onToggleFav, onClose, onEdit }) {
  if (!user) return null;
  const sections = [
    { title: "Contact", icon: <Mail size={16} />, items: [
      { label: "Email", value: user.email, icon: <Mail size={13} /> },
      { label: "Phone", value: user.phone, icon: <Phone size={13} /> },
      { label: "Website", value: user.website, icon: <Globe size={13} /> },
    ]},
    { title: "Address", icon: <MapPin size={16} />, items: [
      { label: "Street", value: `${user.address?.street} ${user.address?.suite}`, icon: <Home size={13} /> },
      { label: "City", value: user.address?.city, icon: <Building2 size={13} /> },
      { label: "ZIP", value: user.address?.zipcode, icon: <MapPin size={13} /> },
    ]},
    { title: "Company", icon: <Building2 size={16} />, items: [
      { label: "Name", value: user.company?.name, icon: <Tag size={13} /> },
      { label: "Motto", value: user.company?.catchPhrase, icon: <MessageSquare size={13} /> },
      { label: "Business", value: user.company?.bs, icon: <Briefcase size={13} /> },
    ]},
  ];
  return (
    <div className="modal-overlay-modern" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container-modern">
        <button className="modal-close-modern" onClick={onClose}>✕</button>
        <div className="modal-header-modern">
          <div className="modal-avatar-large" style={avatarStyle(user.id)}>{getInitials(user.name)}</div>
          <div className="modal-title-section">
            <h2>{user.name}</h2>
            <p>@{user.username}</p>
          </div>
        </div>
        {sections.map((s, i) => (
          <div key={i} className="modal-section-modern">
            <div className="section-header">
              <span className="section-icon">{s.icon}</span>
              <h3>{s.title}</h3>
            </div>
            <div className="section-content">
              {s.items.map((item, j) => (
                <div key={j} className="info-row">
                  <span className="info-label"><span className="info-icon">{item.icon}</span>{item.label}</span>
                  <span className="info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="modal-btn-row">
          <button className={`modal-favorite-btn ${isFav ? "active" : ""}`} onClick={() => onToggleFav(user.id)}>
            <Star size={14} fill={isFav ? "currentColor" : "none"} /> {isFav ? "Unfavorite" : "Favorite"}
          </button>
          <button className="modal-edit-btn" onClick={() => onEdit(user)}><Pencil size={14} /> Edit Profile</button>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────── */
function SkeletonCards({ count = 8 }) {
  return (
    <div className="user-cards-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card-modern">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-line" style={{ width: "70%" }}></div>
          <div className="skeleton-line" style={{ width: "50%" }}></div>
          <div className="skeleton-line" style={{ width: "90%" }}></div>
          <div className="skeleton-line" style={{ width: "60%" }}></div>
        </div>
      ))}
    </div>
  );
}

/* ── Toasts ───────────────────────────────────────────────── */
function Toasts({ toasts }) {
  return (
    <div className="toast-container-modern">
      {toasts.map(t => (
        <div key={t.id} className={`toast-modern ${t.type}`}>
          <span className="toast-icon">{t.type === "success" ? <Check size={16} /> : t.type === "error" ? <X size={16} /> : t.type === "warning" ? <AlertTriangle size={16} /> : <Info size={16} />}</span>
          <span className="toast-message">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ══ MAIN DASHBOARD ════════════════════════════════════════ */
export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("viewMode") || "card");
  const [filters, setFilters] = useState({ search: "", cities: [], companies: [], favOnly: false });
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [liveDate, setLiveDate] = useState('');

  const [cardOrder, setCardOrder] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const mainRef = useRef(null);
  const { isFav, toggle: toggleFav, count: favCount } = useFavorites();
  const { toasts, add: addToast } = useToasts();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUsers(data);
        setCardOrder(data.map(u => u.id));
        addToast(`✅ ${data.length} users loaded`, "success");
      } catch {
        setError("Failed to load users. Please check your connection.");
        addToast("❌ Failed to load users", "error");
      } finally { setLoading(false); }
    })();
  }, [addToast]);

  useEffect(() => { localStorage.setItem("viewMode", viewMode); }, [viewMode]);
  useEffect(() => { mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [page]);

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Good morning');
    else if (hrs < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    const updateDate = () => setLiveDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    updateDate();
    const id = setInterval(updateDate, 60000);
    return () => clearInterval(id);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users");
      const data = await res.json();
      setUsers(data);
      setCardOrder(data.map(u => u.id));
      addToast("🔄 Data refreshed", "success");
    } catch { addToast("❌ Failed to refresh", "error"); }
    finally { setRefreshing(false); }
  }, [addToast]);

  const saveProfile = useCallback((updated) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (selectedUser?.id === updated.id) setSelectedUser(updated);
    addToast("✅ Profile saved", "success");
  }, [selectedUser, addToast]);

  const exportCSV = useCallback(() => {
    const exp = users;
    const headers = ["ID","Name","Username","Email","Phone","City","Company"];
    const rows = exp.map(u => [u.id,u.name,u.username,u.email,u.phone,u.address?.city||"",u.company?.name||""].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","));
    const blob = new Blob(["\uFEFF"+[headers.join(","),...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `users_${Date.now()}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
    addToast(`📊 Exported ${exp.length} users`, "success");
  }, [users, addToast]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `users_${Date.now()}.json` });
    a.click(); URL.revokeObjectURL(a.href);
    addToast(`📋 Exported ${users.length} users as JSON`, "success");
  }, [users, addToast]);

  const cities = useMemo(() => [...new Set(users.map(u => u.address?.city).filter(Boolean))].sort(), [users]);
  const companies = useMemo(() => [...new Set(users.map(u => u.company?.name).filter(Boolean))].sort(), [users]);

  const processed = useMemo(() => {
    let result = cardOrder.map(id => users.find(u => u.id === id)).filter(Boolean);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q));
    }
    if (filters.cities.length) result = result.filter(u => filters.cities.includes(u.address?.city));
    if (filters.companies.length) result = result.filter(u => filters.companies.includes(u.company?.name));
    if (filters.favOnly) result = result.filter(u => isFav(u.id));

    if (sortField) {
      const dir = sortDir === "asc" ? 1 : -1;
      result.sort((a, b) => {
        const av = sortField === "city" ? a.address?.city || "" : sortField === "company" ? a.company?.name || "" : (a[sortField] || "").toLowerCase();
        const bv = sortField === "city" ? b.address?.city || "" : sortField === "company" ? b.company?.name || "" : (b[sortField] || "").toLowerCase();
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    return result;
  }, [users, cardOrder, filters, isFav, sortField, sortDir]);

  const totalPages = Math.ceil(processed.length / PAGE_SIZE);
  const paginated = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = !!(filters.search || filters.cities.length || filters.companies.length || filters.favOnly);

  const updateFilter = (key, value) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); };
  const clearFilters = () => { setFilters({ search: "", cities: [], companies: [], favOnly: false }); setPage(1); addToast("🧹 Filters cleared", "info"); };

  const handleSort = (field) => {
    setSortField(f => { if (f === field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortDir("asc"); } return field; });
    setPage(1);
  };

  // Drag-and-drop
  const handleDragStart = (index) => setDragFrom(paginated[index]?.id);
  const handleDragOver = (index) => setDragOver(paginated[index]?.id);
  const handleDrop = () => {
    if (dragFrom === null || dragOver === null || dragFrom === dragOver) { setDragFrom(null); setDragOver(null); return; }
    setCardOrder(prev => {
      const next = [...prev];
      const fi = next.indexOf(dragFrom), ti = next.indexOf(dragOver);
      next.splice(fi, 1); next.splice(ti, 0, dragFrom);
      return next;
    });
    setDragFrom(null); setDragOver(null);
  };

  const stats = [
    { label: "Total Users", value: users.length, change: "+12%", icon: <Users size={22} />, gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
    { label: "Favorites", value: favCount, change: "+5%", icon: <Star size={22} />, gradient: "linear-gradient(135deg,#f59e0b,#f97316)" },
    { label: "Companies", value: new Set(users.map(u => u.company?.name)).size, change: "Partners", icon: <Building2 size={22} />, gradient: "linear-gradient(135deg,#10b981,#14b8a6)" },
    { label: "Cities", value: new Set(users.map(u => u.address?.city)).size, change: "Global", icon: <Globe size={22} />, gradient: "linear-gradient(135deg,#06b6d4,#0ea5e9)" },
  ];

  const cityChartData = useMemo(() => {
    const counts = {};
    users.forEach(u => { const c = u.address?.city || "Unknown"; counts[c] = (counts[c] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [users]);

  const companyChartData = useMemo(() => {
    const counts = {};
    users.forEach(u => { const c = u.company?.name || "Unknown"; counts[c] = (counts[c] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [users]);

  const chartColors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#f97316"];

  // Keyboard shortcuts
  useEffect(() => {
    const handler = e => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "f") { e.preventDefault(); document.querySelector(".search-input-enhanced")?.focus(); }
        if (e.key === "e") { e.preventDefault(); exportCSV(); }
        if (e.key === "r") { e.preventDefault(); refresh(); }
        if (e.key === "d") { e.preventDefault(); toggleTheme(); }
      }
      if (e.key === "Escape") { setSelectedUser(null); setEditingUser(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [exportCSV, refresh]);

   return (
    <div className="dashboard-enhanced">

       <div className="dashboard-page-header">
          <div>
            <h1 className="dashboard-heading">{greeting}{users.length > 0 && <span className="heading-name">, {users.find(u => u.email === localStorage.getItem('userEmail'))?.name?.split(' ')[0] || 'there'}</span>}</h1>
            <div className="dashboard-subtitle-row">
              <span className="dashboard-subtitle"><span className="live-dot"></span> {liveDate}</span>
              {users.length > 0 && <span className="user-count-badge"><Users size={12} /> {users.length} users</span>}
            </div>
          </div>
        </div>


      {/* ── Main ── */}
      <main className="dashboard-main-enhanced" ref={mainRef}>

        {/* Stats */}
        {!loading && users.length > 0 && (
          <>
            <div className="stats-overview">
              {stats.map((s, i) => <StatCard key={s.label} stat={s} idx={i} />)}
            </div>

            <div className="analytics-toggle">
              <button className={`analytics-toggle-btn ${showAnalytics ? "active" : ""}`} onClick={() => setShowAnalytics(!showAnalytics)}>
                {showAnalytics ? "▼ Hide Analytics" : "▶ Show Analytics"}
              </button>
            </div>

            {showAnalytics && (
              <div className="analytics-grid">
                <DonutChart data={cityChartData} colors={chartColors} title={<><Building2 size={16} /> Cities</>} badge={`${cityChartData.length} cities`} />
                <DonutChart data={companyChartData} colors={chartColors.slice(1)} title={<><Building2 size={16} /> Companies</>} badge={`${companyChartData.length} orgs`} />
                <AreaChart users={users} favorites={favCount} />
              </div>
            )}
          </>
        )}

        {/* Controls */}
        <div className="controls-enhanced">
          <div className="search-wrapper">
            <Search size={17} className="search-icon" />
            <input className="search-input-enhanced" type="text" placeholder="Search users… (Ctrl+F)"
              value={filters.search} onChange={e => updateFilter("search", e.target.value)} />
            {filters.search && <button className="clear-search-btn" onClick={() => updateFilter("search", "")}>✕</button>}
          </div>

          <div className="view-toggle-enhanced">
            <button className={`toggle-btn-enhanced ${viewMode === "card" ? "active" : ""}`} onClick={() => setViewMode("card")} title="Card View">
              <Grid3X3 size={15} />
            </button>
            <button className={`toggle-btn-enhanced ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")} title="Table View">
              <List size={15} />
            </button>
            <button className={`icon-btn-enhanced ${refreshing ? "spin" : ""}`} onClick={refresh} disabled={refreshing} title="Refresh (Ctrl+R)">
            <RefreshCw size={16} />
          </button>
          </div>

          

          <div className="export-dropdown-enhanced">
            <button className="icon-btn-enhanced" title="Export">
              <Download size={16} />
            </button>
            <div className="export-menu-enhanced">
              <button onClick={exportCSV}><FileText size={14} /> Export CSV</button>
              <button onClick={exportJSON}><Clipboard size={14} /> Export JSON</button>
            </div>
          </div>

          <div className="filters-group">
            <TagFilterInput
              tags={filters.cities}
              onAdd={c => updateFilter("cities", [...filters.cities, c])}
              onRemove={c => updateFilter("cities", filters.cities.filter(x => x !== c))}
              placeholder="Filter cities…"
              options={cities}
            />
            <TagFilterInput
              tags={filters.companies}
              onAdd={c => updateFilter("companies", [...filters.companies, c])}
              onRemove={c => updateFilter("companies", filters.companies.filter(x => x !== c))}
              placeholder="Filter companies…"
              options={companies}
            />
            <button className={`filter-btn ${filters.favOnly ? "active" : ""}`} onClick={() => updateFilter("favOnly", !filters.favOnly)}>
              <Star size={14} /> Favorites {favCount > 0 && <span className="filter-count">{favCount}</span>}
            </button>
            {hasFilters && <button className="clear-filters-btn" onClick={clearFilters}>✕ Clear</button>}
          </div>
        </div>

        {/* Content */}
        <div className="content-area">
          {loading && <SkeletonCards count={PAGE_SIZE} />}

          {error && (
            <div className="error-state">
              <AlertTriangle size={32} className="error-icon" />
              <div className="error-content"><h3>Connection Error</h3><p>{error}</p></div>
              <button className="retry-btn" onClick={refresh}>Try Again</button>
            </div>
          )}

          {!loading && !error && processed.length === 0 && (
            <div className="empty-state-enhanced">
              <Search size={48} className="empty-icon" />
              <h3>No users found</h3>
              <p>Try adjusting your search or filters</p>
              {hasFilters && <button className="clear-filters-btn large" onClick={clearFilters}>Clear all filters</button>}
            </div>
          )}

          {!loading && !error && processed.length > 0 && (
            <>
              <div className="results-info">
                <div className="results-stats">
                  <span className="result-count">
                    {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE,processed.length)} of {processed.length} users
                  </span>
                  {hasFilters && <span className="filter-badge-enhanced"><Target size={12} /> Filtered</span>}
                  {viewMode === "card" && <span className="drag-hint"><GripVertical size={12} /> Drag cards to reorder</span>}
                </div>
              </div>

              {viewMode === "card" ? (
                <div className="user-cards-grid">
                  {paginated.map((user, index) => (
                    <DraggableUserCard
                      key={user.id}
                      user={user}
                      index={index}
                      onSelect={setSelectedUser}
                      isFav={isFav(user.id)}
                      onToggleFav={toggleFav}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDraggingOver={dragOver === user.id}
                    />
                  ))}
                </div>
              ) : (
                <UserTable
                  users={paginated}
                  onSelect={setSelectedUser}
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              )}

              {totalPages > 1 && <Pagination current={page} total={totalPages} onChange={setPage} />}
            </>
          )}
        </div>
      </main>

      {/* Keyboard shortcuts */}
      <div className="shortcuts-help">
        <button className="shortcuts-toggle-btn" title="Keyboard Shortcuts"><Keyboard size={20} /></button>
        <div className="shortcuts-panel-enhanced">
          <h4><Keyboard size={16} /> Shortcuts</h4>
          <ul>
            <li><kbd>Ctrl+F</kbd> Focus search</li>
            <li><kbd>Ctrl+D</kbd> Toggle theme</li>
            <li><kbd>Ctrl+E</kbd> Export CSV</li>
            <li><kbd>Ctrl+R</kbd> Refresh</li>
            <li><kbd>Esc</kbd> Close / clear</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      {selectedUser && !editingUser && (
        <UserDetail
          user={selectedUser}
          isFav={isFav(selectedUser.id)}
          onToggleFav={id => { toggleFav(id); addToast(isFav(id) ? "Removed from favorites" : "Added to favorites", "success"); }}
          onClose={() => setSelectedUser(null)}
          onEdit={u => { setEditingUser(u); setSelectedUser(null); }}
        />
      )}

      {editingUser && (
        <ProfileEditModal
          user={editingUser}
          onSave={saveProfile}
          onClose={() => setEditingUser(null)}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}