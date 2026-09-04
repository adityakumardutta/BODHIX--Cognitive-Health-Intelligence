import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { Icons } from '../components/Icons.jsx'

// New registration UI (visual source: Animation/project). All logic, APIs,
// validation and consent handling are the REAL existing BODHIX ones.
const initial = {
  fullName: '', age: '', gender: '', phone: '', location: '', consentGiven: false,
}

// International calling codes (not limited to +91)
const COUNTRY_CODES = [
  { flag: '\uD83C\uDDEE\uD83C\uDDF3', dial: '+91', country: 'India' },
  { flag: '\uD83C\uDDFA\uD83C\uDDF8', dial: '+1', country: 'USA / Canada' },
  { flag: '\uD83C\uDDEC\uD83C\uDDE7', dial: '+44', country: 'United Kingdom' },
  { flag: '\uD83C\uDDA6\uD83C\uDDFA', dial: '+61', country: 'Australia' },
  { flag: '\uD83C\uDDE6\uD83C\uDDEA', dial: '+971', country: 'UAE' },
  { flag: '\uD83C\uDDF8\uD83C\uDDE6', dial: '+966', country: 'Saudi Arabia' },
  { flag: '\uD83C\uDDF5\uD83C\uDDF0', dial: '+92', country: 'Pakistan' },
  { flag: '\uD83C\uDDF3\uD83C\uDDF5', dial: '+977', country: 'Nepal' },
  { flag: '\uD83C\uDDF1\uD83C\uDDF0', dial: '+94', country: 'Sri Lanka' },
  { flag: '\uD83C\uDDE7\uD83C\uDDE9', dial: '+880', country: 'Bangladesh' },
  { flag: '\uD83C\uDDF2\uD83C\uDDF2', dial: '+60', country: 'Malaysia' },
  { flag: '\uD83C\uDDF8\uD83C\uDDEC', dial: '+65', country: 'Singapore' },
  { flag: '\uD83C\uDDF5\uD83C\uDDED', dial: '+63', country: 'Philippines' },
  { flag: '\uD83C\uDDEE\uD83C\uDDE9', dial: '+62', country: 'Indonesia' },
  { flag: '\uD83C\uDDE8\uD83C\uDDF3', dial: '+86', country: 'China' },
  { flag: '\uD83C\uDDEF\uD83C\uDDF5', dial: '+81', country: 'Japan' },
  { flag: '\uD83C\uDDF0\uD83C\uDDF7', dial: '+82', country: 'South Korea' },
  { flag: '\uD83C\uDDF9\uD83C\uDDED', dial: '+66', country: 'Thailand' },
  { flag: '\uD83C\uDDFB\uD83C\uDDF3', dial: '+84', country: 'Vietnam' },
  { flag: '\uD83C\uDDF9\uD83C\uDDF7', dial: '+90', country: 'Turkey' },
  { flag: '\uD83C\uDDE9\uD83C\uDDEA', dial: '+49', country: 'Germany' },
  { flag: '\uD83C\uDDEB\uD83C\uDDF7', dial: '+33', country: 'France' },
  { flag: '\uD83C\uDDEE\uD83C\uDDF9', dial: '+39', country: 'Italy' },
  { flag: '\uD83C\uDDEA\uD83C\uDDF8', dial: '+34', country: 'Spain' },
  { flag: '\uD83C\uDDF3\uD83C\uDDF1', dial: '+31', country: 'Netherlands' },
  { flag: '\uD83C\uDDF7\uD83C\uDDFA', dial: '+7', country: 'Russia' },
  { flag: '\uD83C\uDDFA\uD83C\uDDF6', dial: '+380', country: 'Ukraine' },
  { flag: '\uD83C\uDDE7\uD83C\uDDF7', dial: '+55', country: 'Brazil' },
  { flag: '\uD83C\uDDF2\uD83C\uDDFD', dial: '+52', country: 'Mexico' },
  { flag: '\uD83C\uDDF1\uD83C\uDDF7', dial: '+234', country: 'Nigeria' },
  { flag: '\uD83C\uDDEC\uD83C\uDDED', dial: '+233', country: 'Ghana' },
  { flag: '\uD83C\uDDF0\uD83C\uDDEA', dial: '+254', country: 'Kenya' },
  { flag: '\uD83C\uDDF9\uD83C\uDDFF', dial: '+255', country: 'Tanzania' },
  { flag: '\uD83C\uDDF8\uD83C\uDDF4', dial: '+27', country: 'South Africa' },
  { flag: '\uD83C\uDDEB\uD83C\uDDEE', dial: '+20', country: 'Egypt' },
  { flag: '\uD83C\uDDF2\uD83C\uDDFE', dial: '+95', country: 'Myanmar' },
]

function RegDots({ className }) {
  return (
    <div className={`reg-dots ${className || ''}`} aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} style={{ animationDelay: `${i * 90}ms` }} />
      ))}
    </div>
  )
}

function Req() {
  return <span className="reg-req">*</span>
}

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
)

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
)

const ChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
)

export default function NewPerson() {
  const [form, setForm] = useState(initial)
  const [dial, setDial] = useState('+91')
  const [digits, setDigits] = useState('')
  const [codeOpen, setCodeOpen] = useState(false)
  const [codeDir, setCodeDir] = useState('down') // 'down' | 'up'
  const [codeMaxH, setCodeMaxH] = useState(300)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const codeRef = useRef(null)
  const codeListRef = useRef(null)
  const navigate = useNavigate()

  // Country dropdown smart position: prefer opening downward; flip upward when
  // there is not enough room below. The list height is capped to the free
  // viewport space so the list scrolls *inside* the dropdown (no page overflow).
  function computeCodePosition() {
    const el = codeRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const gap = 12
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const up = spaceBelow < 300 + gap && spaceAbove > spaceBelow
    setCodeDir(up ? 'up' : 'down')
    const avail = (up ? spaceAbove : spaceBelow) - gap
    setCodeMaxH(Math.max(160, Math.min(300, Math.floor(avail))))
  }

  function toggleCodeOpen() {
    if (!codeOpen) computeCodePosition()
    setCodeOpen((o) => !o)
  }

  // Reposition the dropdown while it is open (window resize) and close on Escape.
  useEffect(() => {
    if (!codeOpen) return
    function onResize() { computeCodePosition() }
    function onKey(e) { if (e.key === 'Escape') setCodeOpen(false) }
    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKey)
    }
  }, [codeOpen])

  // Close the country dropdown when clicking anywhere else
  useEffect(() => {
    if (!codeOpen) return
    function onDoc(e) {
      if (codeRef.current && !codeRef.current.contains(e.target)) setCodeOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [codeOpen])
  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.gender) {
      setError('Please select a gender before starting the screening.')
      return
    }
    if (!form.consentGiven) {
      setError('Consent must be confirmed before starting a screening.')
      return
    }
    setLoading(true)
    try {
      // Phone is OPTIONAL: empty is submitted as an empty string.
      const phone = digits.trim() ? `${dial}${digits.trim()}` : ''
      const person = await api.post('/persons', { ...form, phone, age: Number(form.age) })
      navigate(`/screening/${person.id}/intro`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selected = COUNTRY_CODES.find((c) => c.dial === dial) || COUNTRY_CODES[0]

  return (
    <div className="flex-1 h-full overflow-y-auto flex items-start justify-center px-4 py-8 sm:py-10" style={{ minWidth: 0 }}>
      <div className="w-full max-w-3xl reg-rise relative">
        {/* Large centered rounded form card */}
        <div
          className="glass-card relative p-6 sm:p-10 md:p-12"
          style={{ borderRadius: '2rem', boxShadow: '0 30px 80px -40px rgba(59,99,246,.45)' }}
        >
          <RegDots className="absolute right-7 top-7" />
          <RegDots className="absolute bottom-7 left-7 opacity-70" />

          {/* Header */}
          <header className="relative text-center">
            <div className="reg-icon-circle mx-auto grid h-20 w-20 place-items-center rounded-full" style={{ background: 'var(--secondary)' }}>
              <Icons.Users width={30} height={30} />
            </div>
            <h1
              className="font-display mt-5 text-3xl font-bold sm:text-4xl"
              style={{ color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}
            >
              Register a person
            </h1>
            <p className="mt-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Enter the person's details to begin cognitive screening.
            </p>
          </header>

          {/* Form (reg-stagger animates fields in sequence; does not affect submission) */}
          <form onSubmit={handleSubmit} className="reg-stagger relative mt-9 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2 relative z-10">
              {/* Full name */}
              <div>
                <label htmlFor="reg-name" className="label-text mb-1.5">Full name <Req /></label>
                <div className="reg-field">
                  <span style={{ color: 'var(--primary)', opacity: 0.7 }}><Icons.User width={18} height={18} /></span>
                  <input id="reg-name" required placeholder="e.g. Aditya Dutta" autoComplete="name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
                </div>
              </div>

              {/* Age */}
              <div>
                <label htmlFor="reg-age" className="label-text mb-1.5">Age <Req /></label>
                <div className="reg-field">
                  <span style={{ color: 'var(--primary)', opacity: 0.7 }}><Icons.Calendar width={18} height={18} /></span>
                  <input id="reg-age" type="number" min={0} max={130} required placeholder="e.g. 58" value={form.age} onChange={(e) => update('age', e.target.value)} />
                </div>
              </div>

              {/* Gender — starts at === SELECT === */}
              <div>
                <label htmlFor="reg-gender" className="label-text mb-1.5">Gender <Req /></label>
                <div className="reg-field">
                  <span style={{ color: 'var(--primary)', opacity: 0.7 }}><Icons.User width={18} height={18} /></span>
                  <select
                    id="reg-gender"
                    required
                    value={form.gender}
                    onChange={(e) => update('gender', e.target.value)}
                    className="appearance-none"
                  >
                    <option value="" disabled hidden>=== SELECT ===</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                  <span className="pointer-events-none shrink-0" style={{ color: 'var(--text-tertiary)' }}><ChevronDown /></span>
                </div>
              </div>

              {/* Phone (optional) with international country-code selector */}
              <div>
                <label htmlFor="reg-phone" className="label-text mb-1.5">Phone (optional)</label>
                <div className="reg-field relative gap-0 p-0" ref={codeRef} style={{ padding: 0 }}>
                  <button
                    type="button"
                    onClick={toggleCodeOpen}
                    aria-haspopup="listbox"
                    aria-expanded={codeOpen}
                    className="flex shrink-0 items-center gap-1.5 rounded-l-[14px] px-3.5 transition-colors duration-200"
                    style={{ borderRight: '1px solid var(--input-border)', color: 'var(--text-primary)', background: 'transparent', cursor: 'pointer' }}
                  >
                    <span aria-hidden>{selected.flag}</span>
                    <span className="text-sm font-medium">{selected.dial}</span>
                    <ChevronDown size={14} />
                  </button>
                  <div className="flex flex-1 items-center gap-2 px-3.5" style={{ color: 'var(--primary)', opacity: 0.7 }}>
                    <Icons.Phone width={18} height={18} />
                    <input
                      id="reg-phone"
                      inputMode="tel"
                      placeholder="Enter phone number"
                      value={digits}
                      onChange={(e) => setDigits(e.target.value.replace(/[^0-9\s-]/g, ''))}
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                  {codeOpen && (
                    <div
                      ref={codeListRef}
                      className={`reg-code-list reg-code-${codeDir}`}
                      role="listbox"
                      style={{
                        top: codeDir === 'up' ? 'auto' : 'calc(100% + 8px)',
                        bottom: codeDir === 'up' ? 'calc(100% + 8px)' : 'auto',
                        maxHeight: codeMaxH,
                      }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.dial + c.country}
                          type="button"
                          role="option"
                          aria-selected={c.dial === dial}
                          className="reg-code-item"
                          onClick={() => { setDial(c.dial); setCodeOpen(false) }}
                        >
                          <span aria-hidden>{c.flag}</span>
                          <span className="font-semibold">{c.dial}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>{c.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="reg-location" className="label-text mb-1.5">Location <Req /></label>
                <div className="reg-field">
                  <span style={{ color: 'var(--primary)', opacity: 0.7 }}><PinIcon /></span>
                  <input id="reg-location" required placeholder="District / village" value={form.location} onChange={(e) => update('location', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="info-panel flex gap-3 px-4 py-4">
              <span className="mt-0.5 flex-shrink-0" style={{ color: '#2563eb' }}><InfoIcon /></span>
              <div className="relative z-10">
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                  Screening support tool, not a real diagnosis
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  This application is intended for research and screening support only. It is not a diagnostic tool. Screening results should be interpreted by an appropriately qualified healthcare professional.
                </p>
              </div>
            </div>

            {/* Consent — existing real consent logic */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="checkbox-glass"
                checked={form.consentGiven}
                onChange={(e) => update('consentGiven', e.target.checked)}
              />
              <span className="text-sm leading-relaxed transition-opacity group-hover:opacity-90" style={{ color: 'var(--text-secondary)' }}>
                The person (or their authorized representative) has been informed of the research/screening purpose and consents to participate.
              </span>
            </label>

            {error && (
              <p className="text-sm font-medium px-3 py-2 rounded-xl" style={{ color: 'var(--badge-review-text)', background: 'var(--badge-review)' }}>
                {error}
              </p>
            )}

            {/* Start Screening — existing REAL submit/API, new premium button */}
            <button type="submit" disabled={loading} className="reg-btn">
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  Start Screening
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
