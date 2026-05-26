import { useState, useEffect, useMemo } from "react";
import {
  Users, Building2, Globe, Star, TrendingUp, MapPin,
  BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight,
  Eye, EyeOff, Calendar, UserPlus, LogIn,
} from "lucide-react";
import "./Dashboard.css";
import "./Analytics.css";

const CHART_COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#f97316","#0ea5e9"];

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
    <div className="analytics-stat-modern" style={{ "--accent": stat.color }} key={stat.label}>
      <div className="analytics-stat-icon">{stat.icon}</div>
      <div className="analytics-stat-body">
        <div className="analytics-stat-value">{typeof stat.value === "number" ? count.toLocaleString() : stat.value}</div>
        <div className="analytics-stat-label">{stat.label}</div>
      </div>
      <div className="analytics-stat-change">
        {stat.change}
        {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </div>
      <div className="analytics-stat-bar" />
    </div>
  );
}

function BarChartCard({ data, maxValue, title, subtitle, colors }) {
  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <div className="analytics-card-title">
          <BarChart3 size={18} />
          <span>{title}</span>
        </div>
        <span className="analytics-card-badge">{subtitle}</span>
      </div>
      <div className="analytics-chart-bars">
        {data.map(([label, value], i) => (
          <div key={label} className="analytics-bar-row">
            <div className="analytics-bar-label">
              <span>{label}</span>
              <span className="analytics-bar-value">{value}</span>
            </div>
            <div className="analytics-bar-track">
              <div
                className="analytics-bar-fill"
                style={{
                  width: `${(value / maxValue) * 100}%`,
                  background: colors[i % colors.length],
                  animationDelay: `${i * 0.06}s`,
                }}
              />
              <div
                className="analytics-bar-glow"
                style={{
                  width: `${(value / maxValue) * 100}%`,
                  background: colors[i % colors.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutCard({ data, total, title, subtitle, colors }) {
  const [hovered, setHovered] = useState(null);

  const slices = useMemo(() => {
    return data.reduce((acc, [label, value], i) => {
      const pct = value / total;
      const startAngle = acc.cum * 360;
      const newCum = acc.cum + pct;
      const endAngle = newCum * 360;
      const r = 80;
      const cx = 100, cy = 100;
      const rad = a => (a - 90) * Math.PI / 180;
      const x1 = cx + r * Math.cos(rad(startAngle));
      const y1 = cy + r * Math.sin(rad(startAngle));
      const x2 = cx + r * Math.cos(rad(endAngle));
      const y2 = cy + r * Math.sin(rad(endAngle));
      const large = endAngle - startAngle > 180 ? 1 : 0;
      acc.result.push({
        label, value, pct,
        path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
        color: colors[i % colors.length],
      });
      acc.cum = newCum;
      return acc;
    }, { cum: 0, result: [] }).result;
  }, [data, total, colors]);

  const active = hovered !== null ? slices[hovered] : null;

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <div className="analytics-card-title">
          <PieChart size={18} />
          <span>{title}</span>
        </div>
        <span className="analytics-card-badge">{subtitle}</span>
      </div>
      <div className="analytics-donut-body">
        <div className="analytics-donut-svg-wrap">
          <svg viewBox="0 0 200 200" className="analytics-donut-svg">
            {slices.map((s, i) => (
              <path
                key={i} d={s.path} fill={s.color}
                className={`analytics-donut-slice ${hovered === i ? "hovered" : ""}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ transformOrigin: "100px 100px" }}
              />
            ))}
            <circle cx="100" cy="100" r="52" fill="var(--bg-secondary)" />
          </svg>
          <div className="analytics-donut-center">
            {active ? (
              <>
                <span className="analytics-donut-center-value">{active.value}</span>
                <span className="analytics-donut-center-label">{active.label}</span>
              </>
            ) : (
              <>
                <span className="analytics-donut-center-value">{total}</span>
                <span className="analytics-donut-center-label">Total</span>
              </>
            )}
          </div>
        </div>
        <div className="analytics-donut-legend">
          {slices.map((s, i) => (
            <div
              key={i}
              className={`analytics-donut-legend-item ${hovered === i ? "highlighted" : ""}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="analytics-donut-dot" style={{ background: s.color }} />
              <span className="analytics-donut-name">{s.label}</span>
              <span className="analytics-donut-pct">{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityChartCard({ data, maxValue, period, onPeriodChange }) {
  const H = 220;
  const W = data.length * 56;
  const toY = v => H - (v / maxValue) * (H - 24) - 12;
  const loginPoints = data.map((d, i) => `${i * 56 + 28},${toY(d.logins)}`).join(" ");
  const signupPoints = data.map((d, i) => `${i * 56 + 28},${toY(d.signups)}`).join(" ");
  const loginArea = `M24,${H} ${data.map((d, i) => `L${i * 56 + 28},${toY(d.logins)}`).join(" ")} L${(data.length - 1) * 56 + 28},${H} Z`;
  const signupArea = `M24,${H} ${data.map((d, i) => `L${i * 56 + 28},${toY(d.signups)}`).join(" ")} L${(data.length - 1) * 56 + 28},${H} Z`;

  return (
    <div className="analytics-card analytics-card-wide">
      <div className="analytics-card-header">
        <div className="analytics-card-title">
          <Activity size={18} />
          <span>Activity Trends</span>
        </div>
        <div className="analytics-period-group">
          <button className={`analytics-period-btn ${period === "week" ? "active" : ""}`} onClick={() => onPeriodChange("week")}>
            <Calendar size={12} /> Week
          </button>
          <button className={`analytics-period-btn ${period === "month" ? "active" : ""}`} onClick={() => onPeriodChange("month")}>
            <Calendar size={12} /> Month
          </button>
        </div>
      </div>
      <div className="analytics-activity-chart">
        <div className="analytics-y-axis">
          {[maxValue, Math.floor(maxValue * 0.75), Math.floor(maxValue * 0.5), Math.floor(maxValue * 0.25), 0].map(v => (
            <div key={v} className="analytics-y-label">{v}</div>
          ))}
        </div>
        <div className="analytics-chart-svg-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} className="analytics-activity-svg">
            <defs>
              <linearGradient id="aLoginGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="aSignupGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map(f => (
              <line key={f} x1="0" y1={toY(maxValue * f)} x2={W} y2={toY(maxValue * f)} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4" />
            ))}
            <path d={loginArea} fill="url(#aLoginGrad)" className="analytics-area-fill" />
            <path d={signupArea} fill="url(#aSignupGrad)" className="analytics-area-fill" />
            <polyline points={loginPoints} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="analytics-line" />
            <polyline points={signupPoints} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="analytics-line" />
            {data.map((d, i) => (
              <g key={i}>
                <circle cx={i * 56 + 28} cy={toY(d.logins)} r="4" fill="var(--bg-secondary)" stroke="#6366f1" strokeWidth="2" className="analytics-dot" />
                <circle cx={i * 56 + 28} cy={toY(d.signups)} r="4" fill="var(--bg-secondary)" stroke="#10b981" strokeWidth="2" className="analytics-dot" />
                <text x={i * 56 + 28} y={H + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.day}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="analytics-chart-footer">
        <div className="analytics-chart-legend">
          <span className="analytics-legend-dot" style={{ background: "#6366f1" }} />
          <span>Logins</span>
        </div>
        <div className="analytics-chart-legend">
          <span className="analytics-legend-dot" style={{ background: "#10b981" }} />
          <span>Signups</span>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, value, detail, color }) {
  return (
    <div className="analytics-insight-card" style={{ "--accent": color }}>
      <div className="analytics-insight-icon" style={{ background: `${color}15` }}>{icon}</div>
      <div className="analytics-insight-body">
        <div className="analytics-insight-value">{value}</div>
        <div className="analytics-insight-title">{title}</div>
        <div className="analytics-insight-detail">{detail}</div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        const data = await res.json();
        setUsers(data);
      } catch { /* ignore */ }
      finally { setLoading(false) }
    })()
  }, []);

  const cityData = useMemo(() => {
    const counts = {};
    users.forEach(u => { const c = u.address?.city || "Unknown"; counts[c] = (counts[c] || 0) + 1 });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [users]);

  const companyData = useMemo(() => {
    const counts = {};
    users.forEach(u => { const c = u.company?.name || "Unknown"; counts[c] = (counts[c] || 0) + 1 });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [users]);

  const maxCity = Math.max(...cityData.map(([, v]) => v), 1);

  const activityData = useMemo(() => {
    const days = period === "week" ? 7 : 30;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - i - 1))
      return {
        day: d.toLocaleDateString('en-US', period === "week" ? { weekday: 'short' } : { month: 'short', day: 'numeric' }),
        logins: Math.floor(((i + 1) * 7) % Math.max(users.length, 1) * 1.5) + 5,
        signups: Math.floor(((i + 1) * 3) % Math.max(users.length, 1)) + 1,
      }
    })
  }, [users, period]);

  const maxActivity = Math.max(...activityData.flatMap(d => [d.logins, d.signups]));

  const totalCompanies = new Set(users.map(u => u.company?.name)).size;
  const totalCities = new Set(users.map(u => u.address?.city)).size;
  const avgFav = Math.floor(users.length * 0.4);

  const stats = [
    { label: "Total Users", value: users.length, change: "+12%", icon: <Users size={22} />, color: "#6366f1", up: true },
    { label: "Companies", value: totalCompanies, change: "Partners", icon: <Building2 size={22} />, color: "#10b981", up: true },
    { label: "Cities", value: totalCities, change: "Regions", icon: <Globe size={22} />, color: "#06b6d4", up: true },
    { label: "Avg Favorites", value: avgFav, change: "+5%", icon: <Star size={22} />, color: "#f59e0b", up: true },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: <TrendingUp size={16} /> },
    { id: "users", label: "Users", icon: <Users size={16} /> },
    { id: "activity", label: "Activity", icon: <Activity size={16} /> },
  ];

  if (loading) {
    return (
      <div className="dashboard-enhanced analytics-page">
        <main className="dashboard-main-enhanced">
          <div className="analytics-skeleton">
            <div className="analytics-skeleton-header" />
            <div className="analytics-skeleton-grid">
              {[1,2,3,4].map(i => <div key={i} className="analytics-skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />)}
            </div>
            <div className="analytics-skeleton-chart" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-enhanced analytics-page">
      <main className="dashboard-main-enhanced">
        <div className="analytics-page-header">
          <div>
            <h1 className="analytics-heading">Analytics</h1>
            <p className="analytics-subtitle">Real-time insights and trends from your user data</p>
          </div>
          <button className="analytics-toggle-stats" onClick={() => setShowStats(!showStats)}>
            {showStats ? <><EyeOff size={16} /> Hide Stats</> : <><Eye size={16} /> Show Stats</>}
          </button>
        </div>

        {showStats && (
          <div className="analytics-stat-grid">
            {stats.map((s, i) => <StatCard key={s.label} stat={s} idx={i} />)}
          </div>
        )}

        <div className="analytics-tab-bar">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`analytics-tab-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className={`analytics-tab-content ${activeTab}`}>
          {activeTab === "overview" && (
            <div className="analytics-grid-overview">
              <BarChartCard
                data={cityData}
                maxValue={maxCity}
                title="Users by City"
                subtitle={`${cityData.length} cities`}
                colors={CHART_COLORS}
              />
              <DonutCard
                data={companyData}
                total={users.length}
                title="Company Distribution"
                subtitle={`${companyData.length} orgs`}
                colors={CHART_COLORS}
              />
              <ActivityChartCard
                data={activityData}
                maxValue={maxActivity}
                period={period}
                onPeriodChange={setPeriod}
              />
            </div>
          )}

          {activeTab === "users" && (
            <div className="analytics-grid-insights">
              <div className="analytics-insights-row">
                <InsightCard
                  icon={<Users size={22} />}
                  title="Total Users"
                  value={users.length}
                  detail="Across all organizations"
                  color="#6366f1"
                />
                <InsightCard
                  icon={<Building2 size={22} />}
                  title="Organizations"
                  value={totalCompanies}
                  detail={users.length > 0 ? `${(users.length / totalCompanies).toFixed(1)} avg per org` : "N/A"}
                  color="#10b981"
                />
                <InsightCard
                  icon={<MapPin size={22} />}
                  title="Cities"
                  value={totalCities}
                  detail={users.length > 0 ? `${(users.length / totalCities).toFixed(1)} avg per city` : "N/A"}
                  color="#06b6d4"
                />
                <InsightCard
                  icon={<Star size={22} />}
                  title="Favorites Rate"
                  value={`${Math.round(avgFav / users.length * 100)}%`}
                  detail={`${avgFav} of ${users.length} users`}
                  color="#f59e0b"
                />
              </div>
              <div className="analytics-grid-double">
                <BarChartCard
                  data={cityData}
                  maxValue={maxCity}
                  title="City Breakdown"
                  subtitle={`${cityData.length} cities`}
                  colors={CHART_COLORS}
                />
                <BarChartCard
                  data={companyData}
                  maxValue={Math.max(...companyData.map(([, v]) => v), 1)}
                  title="Company Breakdown"
                  subtitle={`${companyData.length} orgs`}
                  colors={CHART_COLORS.slice(2)}
                />
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="analytics-grid-activity">
              <ActivityChartCard
                data={activityData}
                maxValue={maxActivity}
                period={period}
                onPeriodChange={setPeriod}
              />
              <div className="analytics-insights-row">
                <InsightCard
                  icon={<LogIn size={22} />}
                  title="Total Logins"
                  value={activityData.reduce((s, d) => s + d.logins, 0).toLocaleString()}
                  detail={`${period === "week" ? "7-day" : "30-day"} period`}
                  color="#6366f1"
                />
                <InsightCard
                  icon={<UserPlus size={22} />}
                  title="Total Signups"
                  value={activityData.reduce((s, d) => s + d.signups, 0).toLocaleString()}
                  detail={`${period === "week" ? "7-day" : "30-day"} period`}
                  color="#10b981"
                />
                <InsightCard
                  icon={<Activity size={22} />}
                  title="Avg Daily"
                  value={Math.round(activityData.reduce((s, d) => s + d.logins + d.signups, 0) / activityData.length).toLocaleString()}
                  detail="Logins + Signups"
                  color="#8b5cf6"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
