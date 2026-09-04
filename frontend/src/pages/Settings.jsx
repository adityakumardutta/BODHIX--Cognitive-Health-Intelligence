import { useState } from "react"
import { useAuth } from "../services/authContext.jsx"
import { useOffline } from "../services/offlineContext.jsx"
import { useTheme } from "../services/ThemeContext.jsx"
import GlassCard from "../components/GlassCard.jsx"
import Button from "../components/Button.jsx"
import { Icons } from "../components/Icons.jsx"

export default function Settings() {
  const { user, logout } = useAuth()
  const { pendingCount, sync, syncing, isOnline } = useOffline()
  const { theme, toggleTheme } = useTheme()
  const dark = theme === "dark"

  const [activeSection, setActiveSection] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [editedFields, setEditedFields] = useState({})
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifSms, setNotifSms] = useState(false)
  const [notifFollowup, setNotifFollowup] = useState(true)
  const [language, setLanguage] = useState("en")
  const [syncMessage, setSyncMessage] = useState("")

  async function handleSync() {
    try {
      const res = await sync()
      setSyncMessage(`Synced ${res.synced}, failed ${res.failed}.`)
    } catch (e) {
      setSyncMessage(e.message)
    }
  }

  const sections = [
    { id: "profile", icon: <Icons.UserCheck />, label: "Profile" },
    { id: "appearance", icon: <Icons.Sun />, label: "Appearance" },
    { id: "notifications", icon: <Icons.Bell />, label: "Notifications" },
    { id: "screening", icon: <Icons.ClipboardCheck />, label: "Screening Preferences" },
    { id: "security", icon: <Icons.Shield />, label: "Security" },
  ]

  const fullName = user?.fullName || user?.name || ""
  const initials = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "U"

  const profileFields = [
    { label: "Full Name", value: editedFields["Full Name"] ?? fullName, editable: true },
    { label: "Email", value: user?.email || "", editable: false },
    { label: "District", value: editedFields["District"] ?? (user?.district || ""), editable: true },
    { label: "Phone", value: editedFields["Phone"] ?? (user?.phone || ""), editable: true },
  ]

  const handleEditField = (label, value) => setEditedFields((prev) => ({ ...prev, [label]: value }))
  // No profile-update API exists in the backend — UI-only edit state.
  const handleSaveProfile = () => { setIsEditing(false); setEditedFields({}) }
  const handleCancelEdit = () => { setIsEditing(false); setEditedFields({}) }

  const Toggle = ({ value, onChange }) => (
    <button type="button" role="switch" aria-checked={value} onClick={onChange} className={`toggle-switch ${value ? "on" : "off"}`}>
      <div className="toggle-knob" style={{ left: value ? 20 : 2 }} />
    </button>
  )

  return (
    <div className="screen-content flex flex-col gap-5 h-full">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Manage your preferences and account settings</p>
      </div>

      <div className="flex gap-5 min-h-0 flex-1">
        <GlassCard className="p-3 flex flex-col gap-1 flex-shrink-0" style={{ width: 210, alignSelf: "flex-start" }}>
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className="settings-nav-btn flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left"
              style={{
                background: s.id === activeSection ? "var(--secondary)" : "transparent",
                color: s.id === activeSection ? "var(--primary)" : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <span style={{ opacity: s.id === activeSection ? 1 : 0.6 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </GlassCard>

        <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto">
          {activeSection === "profile" && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ background: "var(--primary)", color: "white" }}>{initials}</div>
                <div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{fullName}</div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{user?.role || "Health Worker"}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{user?.email || ""}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileFields.map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
                    <input
                      type="text"
                      value={f.value}
                      readOnly={!isEditing || !f.editable}
                      onChange={(e) => handleEditField(f.label, e.target.value)}
                      className={`glass-input w-full px-3 py-2.5 rounded-xl text-sm ${!f.editable ? "opacity-70" : ""}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                {!isEditing ? (
                  <Button variant="secondary" onClick={() => { setEditedFields({}); setIsEditing(true) }}>Edit Profile</Button>
                ) : (
                  <>
                    <Button variant="primary" onClick={handleSaveProfile}>Save</Button>
                    <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                  </>
                )}
              </div>
            </GlassCard>
          )}
          {activeSection === "appearance" && (
            <GlassCard className="p-6">
              <h2 className="font-semibold text-base mb-4" style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}>Appearance</h2>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Theme: {dark ? "Dark" : "Light"}</p>
              <div className="flex gap-4">
                {[{ label: "Light", preview: "#e8ecf5", isDark: false }, { label: "Dark", preview: "#06091a", isDark: true }].map((t) => (
                  <button key={t.label} type="button" onClick={() => { if (dark === t.isDark) return; toggleTheme() }}
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl transition-all hover:opacity-80"
                    style={{ border: `1px solid ${dark === t.isDark ? "var(--primary)" : "var(--glass-border)"}`, background: dark === t.isDark ? "var(--secondary)" : "transparent", cursor: "pointer", flex: 1 }}>
                    <div className="w-full h-16 rounded-xl relative overflow-hidden" style={{ background: t.preview }}>
                      <div className="absolute left-2 top-2 w-10 h-10 rounded-lg" style={{ background: "rgba(255,255,255,0.5)" }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: dark === t.isDark ? "var(--primary)" : "var(--text-secondary)" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {activeSection === "notifications" && (
            <GlassCard className="p-6">
              <h2 className="font-semibold text-base mb-4" style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}>Notifications</h2>
              <div className="flex flex-col gap-3">
                {[{ label: "Email notifications", desc: "Receive screening summaries by email", value: notifEmail, set: setNotifEmail },
                  { label: "SMS alerts", desc: "Follow-up reminders via SMS", value: notifSms, set: setNotifSms },
                  { label: "Follow-up reminders", desc: "Alerts for upcoming and overdue follow-ups", value: notifFollowup, set: setNotifFollowup }].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{item.desc}</div>
                    </div>
                    <Toggle value={item.value} onChange={() => item.set(!item.value)} />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
          {activeSection === "screening" && (
            <GlassCard className="p-6">
              <h2 className="font-semibold text-base mb-4" style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}>Screening Preferences</h2>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Language</label>
              <select className="glass-input px-3 py-2.5 rounded-xl text-sm max-w-xs" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="es" disabled>Español (coming soon)</option>
                <option value="fr" disabled>Français (coming soon)</option>
              </select>
              <p className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>The interface is built to support additional languages in the future.</p>
              <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--glass-border)" }}>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Status: {isOnline ? "Online" : "Offline"} · {pendingCount} screening(s) pending synchronization</p>
                <Button className="mt-3" variant="secondary" onClick={handleSync} disabled={syncing || pendingCount === 0}>{syncing ? "Syncing…" : "Sync now"}</Button>
                {syncMessage && <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{syncMessage}</p>}
              </div>
            </GlassCard>
          )}

          {activeSection === "security" && (
            <GlassCard className="p-6">
              <h2 className="font-semibold text-base mb-4" style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}>Security &amp; Privacy</h2>
              <div className="flex gap-3">
                <Button variant="secondary">Change password</Button>
                <Button variant="secondary" onClick={logout}>Logout</Button>
              </div>
              <p className="mt-4 text-xs" style={{ color: "var(--text-tertiary)" }}>Screening data is used only for screening support and follow-up coordination. This application is a research-inspired educational software project and not a medical diagnostic system.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}