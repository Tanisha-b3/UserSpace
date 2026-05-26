import { useState, useCallback } from "react";
import {
  Settings as SettingsIcon, Sun, Moon, Bell,
  FileText, Clipboard, Trash2, CheckCircle, Activity,
  Sparkles, Download,
} from "lucide-react";
import "./Dashboard.css";
import "./Settings.css";

export default function Settings() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [notifs, setNotifs] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [savedId, setSavedId] = useState(null);

  const toggleSetting = (key, value) => {
    if (key === "theme") {
      setTheme(value);
      document.documentElement.setAttribute("data-theme", value);
      localStorage.setItem("theme", value);
    }
    if (key === "notifs") setNotifs(value);
    if (key === "animations") setAnimations(value);
    setSavedId(key);
    setTimeout(() => setSavedId(null), 2000);
  };

  const exportData = useCallback((format) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (format === "json") {
      const blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `users_${Date.now()}.json` });
      a.click();
    } else {
      const headers = ["ID","Name","Username","Email","Phone","City","Company"];
      const rows = users.map(u => [u.id, u.name, u.username, u.email, u.phone, u.address?.city || "", u.company?.name || ""].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `users_${Date.now()}.csv` });
      a.click();
    }
  }, []);

  const clearData = () => {
    if (window.confirm("Clear all cached data? This cannot be undone.")) {
      localStorage.removeItem("favs");
      localStorage.removeItem("viewMode");
      window.location.reload();
    }
  };

  const sections = [
    {
      id: "appearance",
      title: "Appearance",
      icon: <Sparkles size={18} />,
      items: [
        {
          id: "theme",
          label: "Theme",
          desc: "Choose between light and dark mode",
          control: (
            <div className="settings-toggle-group">
              <button
                className={`settings-toggle-opt ${theme === "light" ? "active" : ""}`}
                onClick={() => toggleSetting("theme", "light")}
              >
                <Sun size={15} /> Light
              </button>
              <button
                className={`settings-toggle-opt ${theme === "dark" ? "active" : ""}`}
                onClick={() => toggleSetting("theme", "dark")}
              >
                <Moon size={15} /> Dark
              </button>
            </div>
          ),
        },
        {
          id: "animations",
          label: "Animations",
          desc: "Enable smooth transitions and effects throughout the dashboard",
          control: (
            <label className="settings-switch">
              <input type="checkbox" checked={animations} onChange={e => toggleSetting("animations", e.target.checked)} />
              <span className="settings-switch-track">
                <span className="settings-switch-thumb" />
              </span>
              <span className="settings-switch-label">{animations ? "Enabled" : "Disabled"}</span>
            </label>
          ),
        },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <Bell size={18} />,
      items: [
        {
          id: "notifs",
          label: "Push Notifications",
          desc: "Receive alerts for user activity and updates",
          control: (
            <label className="settings-switch">
              <input type="checkbox" checked={notifs} onChange={e => toggleSetting("notifs", e.target.checked)} />
              <span className="settings-switch-track">
                <span className="settings-switch-thumb" />
              </span>
              <span className="settings-switch-label">{notifs ? "Enabled" : "Disabled"}</span>
            </label>
          ),
        },
      ],
    },
    {
      id: "data",
      title: "Data Management",
      icon: <Download size={18} />,
      items: [
        {
          id: "export",
          label: "Export Users",
          desc: "Download all user data for backup or analysis",
          control: (
            <div className="settings-toggle-group">
              <button className="settings-action-btn" onClick={() => exportData("json")}>
                <FileText size={14} /> Export JSON
              </button>
              <button className="settings-action-btn" onClick={() => exportData("csv")}>
                <Clipboard size={14} /> Export CSV
              </button>
            </div>
          ),
        },
        {
          id: "cache",
          label: "Clear Cache",
          desc: "Remove all locally stored favorites and preferences",
          control: (
            <button className="settings-action-btn danger" onClick={clearData}>
              <Trash2 size={14} /> Clear Data
            </button>
          ),
        },
      ],
    },
  ];

  return (
    <div className="dashboard-enhanced settings-page">
      <main className="dashboard-main-enhanced">
        <div className="settings-header">
          <div>
            <h1 className="settings-heading">Settings</h1>
            <p className="settings-subtitle">Customize your dashboard experience</p>
          </div>
        </div>

        <div className="settings-stats">
          <div className="sett-stat-card" style={{ "--accent": "#6366f1" }}>
            <div className="sett-stat-icon"><SettingsIcon size={22} /></div>
            <div className="sett-stat-body">
              <div className="sett-stat-value">Settings</div>
              <div className="sett-stat-label">Dashboard Preferences</div>
            </div>
            <div className="sett-stat-bar" />
          </div>
          <div className="sett-stat-card" style={{ "--accent": "#f59e0b" }}>
            <div className="sett-stat-icon">{theme === "dark" ? <Moon size={22} /> : <Sun size={22} />}</div>
            <div className="sett-stat-body">
              <div className="sett-stat-value capitalize">{theme}</div>
              <div className="sett-stat-label">Active Theme</div>
            </div>
            <div className="sett-stat-bar" />
          </div>
          <div className="sett-stat-card" style={{ "--accent": "#10b981" }}>
            <div className="sett-stat-icon"><Activity size={22} /></div>
            <div className="sett-stat-body">
              <div className="sett-stat-value">{animations ? "On" : "Off"}</div>
              <div className="sett-stat-label">Animations</div>
            </div>
            <div className="sett-stat-bar" />
          </div>
        </div>

        <div className="settings-sections">
          {sections.map(section => (
            <div key={section.id} className="settings-section-card">
              <div className="settings-section-title">
                <span className="settings-section-icon">{section.icon}</span>
                <h3>{section.title}</h3>
              </div>
              <div className="settings-items">
                {section.items.map(item => (
                  <div key={item.id} className="settings-item">
                    <div className="settings-item-info">
                      <div className="settings-item-label">
                        {item.label}
                        {savedId === item.id && <CheckCircle size={14} className="settings-saved-icon" />}
                      </div>
                      <div className="settings-item-desc">{item.desc}</div>
                    </div>
                    <div className="settings-item-control">{item.control}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
