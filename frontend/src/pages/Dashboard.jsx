import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FilePlus2,
  HeartPulse,
  ShieldCheck,
  Users,
  UserRound,
  AlertCircle,
} from 'lucide-react'

import { api } from '../services/api.js'
import { useAuth } from '../services/authContext.jsx'
import skullImg from '../assets/skull.png'
import GlassCard from '../components/GlassCard.jsx'
import { StatusBadge } from '../components/Badge.jsx'
import WelcomeDialog from '../components/WelcomeDialog.jsx'

function personName(p) {
  return p?.name || p?.fullName || 'Unnamed'
}

function personAge(p) {
  return p?.age ?? p?.ageYears ?? '—'
}

function personLocation(p) {
  return p?.location || p?.district || p?.region || '—'
}

function personLastScreening(p) {
  const v = p?.lastScreening || p?.lastScreeningDate || p?.lastScreenedAt
  return v ? String(v).slice(0, 10) : 'Not screened'
}

function personStatus(p) {
  return p?.status || p?.riskStatus || p?.resultSummary || 'Not screened'
}

function initials(name) {
  return String(name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/* -------------------------------------------------------
   KPI CARD
-------------------------------------------------------- */

function MetricCard({
  icon,
  value,
  label,
  description,
  tone,
  href,
}) {
  const tones = {
    blue: {
      bg: 'rgba(59,130,246,.11)',
      color: '#2563eb',
    },
    red: {
      bg: 'rgba(239,68,68,.10)',
      color: '#ef4444',
    },
    amber: {
      bg: 'rgba(245,158,11,.11)',
      color: '#f59e0b',
    },
    green: {
      bg: 'rgba(16,185,129,.11)',
      color: '#10b981',
    },
  }

  const t = tones[tone] || tones.blue

  const card = (
    <div
      className="
        group relative overflow-hidden
        rounded-[22px] border
        p-5
        transition-all duration-200
        hover:-translate-y-1
        hover:shadow-[0_18px_38px_rgba(65,93,140,.14)]
      "
      style={{
        borderColor: 'var(--glass-border)',
        background: 'var(--dash-card-bg)',
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl"
          style={{
            background: t.bg,
            color: t.color,
          }}
        >
          {icon}
        </span>

        <span
          className="
            grid h-9 w-9 place-items-center rounded-full
            bg-white/95 text-slate-500
            transition-transform duration-200
            group-hover:translate-x-0.5
          "
        >
          <ArrowRight size={16} />
        </span>
      </div>

      <div className="mt-5">
        <div
          className="text-[30px] font-extrabold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {value ?? '—'}
        </div>

        <div
          className="mt-1 text-sm font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </div>

        <div
          className="mt-1 text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          {description}
        </div>
      </div>
    </div>
  )

  return href ? <Link to={href}>{card}</Link> : card
}

/* -------------------------------------------------------
   QUICK ACTION
-------------------------------------------------------- */

function QuickAction({
  href,
  icon,
  title,
  description,
  type = 'normal',
}) {
  const primary = type === 'primary'

  return (
    <Link
      to={href}
      className={`
        group flex min-h-[120px] flex-col justify-between
        rounded-[20px] border p-4
        transition-all duration-200
        hover:-translate-y-1
        hover:shadow-[0_16px_32px_rgba(65,93,140,.14)]
        ${primary
          ? 'border-transparent bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
          : 'border-slate-200/70 bg-white/90 text-slate-900'}
      `}
    >
      <div className="flex items-start justify-between">
        <span
          className={`
            grid h-11 w-11 place-items-center rounded-2xl
            ${primary
              ? 'bg-white/15 text-white'
              : 'bg-blue-50 text-blue-600'}
          `}
        >
          {icon}
        </span>

        <span
          className={`
            grid h-9 w-9 place-items-center rounded-full
            transition-transform duration-200
            group-hover:translate-x-0.5
            ${primary
              ? 'bg-white/15 text-white'
              : 'bg-white text-blue-600 shadow-sm'}
          `}
        >
          <ArrowRight size={16} />
        </span>
      </div>

      <div>
        <div className="text-sm font-bold">{title}</div>

        <div
          className={`
            mt-1 text-xs leading-5
            ${primary ? 'text-white/80' : 'text-slate-500'}
          `}
        >
          {description}
        </div>
      </div>
    </Link>
  )
}

/* =======================================================
   DASHBOARD
======================================================= */

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  const today = useMemo(() => new Date(), [])

  // Check if user has dismissed the welcome dialog
  const hasDismissedWelcome = useMemo(() => {
    if (!user?.id) return true
    return localStorage.getItem(`bodhix_welcome_dismissed_${user.id}`) === 'true'
  }, [user?.id])

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        const [statistics, people] = await Promise.all([
          api.get('/dashboard/statistics'),
          api.get('/persons'),
        ])

        if (!active) return

        setStats(statistics)
        setRecent(Array.isArray(people) ? people.slice(0, 5) : [])

        // Show welcome dialog for new users with no data
        const isNewUser = !hasDismissedWelcome &&
          (statistics?.totalPeopleScreened === 0 || !statistics?.totalPeopleScreened) &&
          (statistics?.completedScreenings === 0 || !statistics?.completedScreenings) &&
          (!people || people.length === 0)

        if (isNewUser) {
          // Small delay for smooth UX after dashboard loads
          setTimeout(() => setShowWelcome(true), 800)
        }
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Unable to load dashboard data.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [hasDismissedWelcome])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    // Persist dismissal per user
    if (user?.id) {
      localStorage.setItem(`bodhix_welcome_dismissed_${user.id}`, 'true')
    }
  }

  const handleStartScreening = () => {
    setShowWelcome(false)
    if (user?.id) {
      localStorage.setItem(`bodhix_welcome_dismissed_${user.id}`, 'true')
    }
    navigate('/persons/new')
  }

  const handleExplore = () => {
    setShowWelcome(false)
    if (user?.id) {
      localStorage.setItem(`bodhix_welcome_dismissed_${user.id}`, 'true')
    }
    navigate('/clinical-evidence')
  }

  const firstName = user?.fullName
    ? user.fullName.split(' ')[0]
    : 'there'

  const userRole = user?.role || user?.userRole || 'Specialist'

  return (
    <div className="relative min-h-full overflow-hidden p-4 sm:p-5 lg:p-6">
      {/* Welcome Dialog for New Users */}
      <WelcomeDialog
        isOpen={showWelcome}
        onClose={handleCloseWelcome}
        onStartScreening={handleStartScreening}
        onExplore={handleExplore}
      />

      {/* =================================================
          ANIMATED BACKGROUND
      ================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className="
            absolute -left-24 -top-24
            h-80 w-80 rounded-full
            bg-blue-300/20 blur-3xl
          "
          style={{
            animation: 'bodhixFloatOne 13s ease-in-out infinite',
          }}
        />

        <div
          className="
            absolute right-[-100px] top-[22%]
            h-96 w-96 rounded-full
            bg-purple-300/15 blur-3xl
          "
          style={{
            animation: 'bodhixFloatTwo 16s ease-in-out infinite',
          }}
        />

        <div
          className="
            absolute bottom-[-120px] left-[35%]
            h-96 w-96 rounded-full
            bg-cyan-300/15 blur-3xl
          "
          style={{
            animation: 'bodhixFloatThree 19s ease-in-out infinite',
          }}
        />

        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `
              radial-gradient(
                circle at 15% 20%,
                rgba(255,255,255,.9) 0 1px,
                transparent 1.5px
              ),
              radial-gradient(
                circle at 75% 60%,
                rgba(255,255,255,.8) 0 1px,
                transparent 1.5px
              )
            `,
            backgroundSize: '180px 180px, 260px 260px',
            animation: 'bodhixParticles 25s linear infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes bodhixFloatOne {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }
          50% {
            transform: translate3d(55px,35px,0) scale(1.08);
          }
        }

        @keyframes bodhixFloatTwo {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }
          50% {
            transform: translate3d(-45px,25px,0) scale(1.06);
          }
        }

        @keyframes bodhixFloatThree {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }
          50% {
            transform: translate3d(30px,-35px,0) scale(1.1);
          }
        }

        @keyframes bodhixParticles {
          from {
            background-position: 0 0, 0 0;
          }
          to {
            background-position: 80px -40px, -60px 60px;
          }
        }
      `}</style>

      <div className="relative z-10 mx-auto max-w-[1600px] space-y-5">

        {/* =================================================
            TOP HERO — ONE SINGLE WIDE CARD
        ================================================== */}

        <section
          className="
            relative overflow-hidden
            rounded-[26px]
            border border-[rgba(148,174,212,0.40)]
            px-6 py-6
            shadow-[0_14px_38px_rgba(67,96,140,.09)]
            backdrop-blur-2xl
            sm:px-7
          "
          style={{
            background: 'var(--dash-hero-bg)',
          }}
        >

          {/* Hero glow */}
          <div
            className="
              pointer-events-none
              absolute right-[18%] top-[-80px]
              h-64 w-64 rounded-full
              bg-blue-300/15 blur-3xl
            "
          />

          {/* Responsive: stack below xl so the fixed-width hero companions
              (trust points / skull / today card) never squeeze the greeting.
              At xl+ the layout is identical to the previous lg+ design. */}
          <div className="relative grid grid-cols-1 items-center gap-6 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto]">

            {/* LEFT — GREETING */}
            <div className="min-w-0">

              <div
                className="
                  mb-2 text-[11px] font-bold
                  uppercase tracking-[0.18em]
                  text-slate-500
                "
              >
                {getGreeting()}
              </div>

              <h1
                className="
                  text-3xl font-extrabold
                  tracking-tight text-slate-900
                  sm:text-[37px]
                "
              >
                {user?.fullName || `Aditya Kumar Dutta`} 👋
              </h1>

              <p className="mt-2 max-w-[560px] text-sm leading-6 text-slate-500 sm:text-[15px]">
                Welcome to BODHIX — your cognitive health screening dashboard.
              </p>

              <Link
                to="/persons/new"
                className="
                  mt-4 inline-flex items-center gap-2
                  rounded-xl
                  bg-gradient-to-r from-blue-500 to-teal-500
                  px-4 py-2.5
                  text-sm font-bold text-white
                  shadow-[0_8px_20px_rgba(59,130,246,.20)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:brightness-105
                  hover:shadow-[0_12px_25px_rgba(59,130,246,.27)]
                  active:scale-[.98]
                  focus:outline-none
                  focus:ring-2 focus:ring-blue-300
                "
              >
                <FilePlus2 size={17} />
                New Screening
              </Link>
            </div>

            {/* MIDDLE — TRUST POINTS */}
            <div className="hidden min-w-[150px] gap-3 xl:flex xl:flex-col">

              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={18} />
                </span>
                Evidence Based
              </div>

              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
                  <Users size={18} />
                </span>
                People Centric
              </div>

              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-600">
                  <HeartPulse size={18} />
                </span>
                Better Care
              </div>

            </div>

            {/* BRAIN IMAGE */}
            <div className="relative hidden h-[190px] w-[215px] overflow-hidden xl:block">

              {/* soft glow */}
              <div
                className="
                  absolute inset-3
                  rounded-full
                  bg-indigo-300/30
                  blur-3xl
                "
              />

              <img
                src={skullImg}
                alt="BODHIX skull illustration"
                className="
                  relative z-10
                  h-full w-full
                  object-contain
                  opacity-100
                  drop-shadow-[0_12px_25px_rgba(81,118,210,.20)]
                "
              />
            </div>

            {/* RIGHT — TODAY / ROLE */}
            <div
              className="
                w-full
                rounded-[20px]
                border border-[rgba(148,174,212,0.40)]
                bg-white/90
                p-4
                shadow-sm
                backdrop-blur-xl
                xl:w-auto xl:min-w-[225px]
              "
            >

              <div className="flex items-center gap-3">

                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays size={19} />
                </span>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Today
                  </div>

                  <div className="mt-1 text-sm font-bold text-slate-800">
                    {formatDate(today)}
                  </div>
                </div>

              </div>

              <div className="my-4 h-px bg-slate-200/80" />

              <div className="flex items-center gap-3">

                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600">
                  <UserRound size={19} />
                </span>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Your Role
                  </div>

                  <div className="mt-1 text-sm font-bold text-slate-800">
                    {userRole}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =================================================
            EVIDENCE STRIP
        ================================================== */}

        <section
          className="
            flex flex-col gap-3
            rounded-[20px]
            border border-[rgba(148,174,212,0.40)]
            bg-white/90
            px-5 py-4
            shadow-sm
            backdrop-blur-xl
            md:flex-row md:items-center md:justify-between
          "
        >

          <div className="flex flex-wrap items-center gap-2.5">

            <span className="text-sm font-bold text-slate-800">
              Built around established screening instruments
            </span>

            {['AD8', 'RUDAS', 'PFAQ'].map((item) => (
              <span
                key={item}
                className="
                  rounded-full border
                  border-slate-200/80
                  bg-white/95
                  px-3 py-1
                  text-xs font-bold text-slate-700
                "
              >
                {item}
              </span>
            ))}

          </div>

          <span className="text-xs text-slate-500">
            Transparent scoring • Evidence references • Professional review
          </span>
        </section>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            className="
              rounded-2xl border
              border-red-200/70
              bg-red-50/80
              px-4 py-3
              text-sm text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* =================================================
            KPI CARDS — NO GRAPHS
        ================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            icon={<Users size={27} />}
            value={loading ? '—' : stats?.totalPeopleScreened}
            label="Total People Screened"
            description="Individuals in your care"
            tone="blue"
            href="/persons"
          />

          <MetricCard
            icon={<AlertCircle size={27} />}
            value={loading ? '—' : stats?.peopleNeedingReview}
            label="People Needing Review"
            description="May require attention"
            tone="red"
            href="/persons"
          />

          <MetricCard
            icon={<Clock3 size={27} />}
            value={loading ? '—' : stats?.pendingFollowUps}
            label="Pending Follow-ups"
            description="Upcoming actions"
            tone="amber"
            href="/followups"
          />

          <MetricCard
            icon={<CheckCircle2 size={27} />}
            value={loading ? '—' : stats?.completedScreenings}
            label="Completed Screenings"
            description="Assessments finished"
            tone="green"
          />

        </section>

        {/* =================================================
            PEOPLE + QUICK ACTIONS
        ================================================== */}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(350px,.7fr)]">

          {/* RECENT PEOPLE */}

          <GlassCard
            className="overflow-hidden"
            style={{
              padding: 0,
              borderRadius: 22,
            }}
          >

            <div className="flex items-center justify-between gap-4 px-5 pb-4 pt-5">

              <div>
                <h2
                  className="text-base font-extrabold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Recently Registered People
                </h2>

                <p
                  className="mt-1 text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Latest patient records in your workspace
                </p>
              </div>

              <Link
                to="/persons"
                className="
                  inline-flex items-center gap-1.5
                  rounded-xl
                  bg-blue-50
                  px-3 py-2
                  text-xs font-bold text-blue-700
                  transition-all duration-200
                  hover:-translate-y-0.5
                "
              >
                View all
                <ArrowRight size={14} />
              </Link>

            </div>

            <div className="px-5 pb-5">

              {loading ? (

                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((x) => (
                    <div
                      key={x}
                      className="h-[56px] animate-pulse rounded-xl bg-slate-100/70"
                    />
                  ))}
                </div>

              ) : recent.length === 0 ? (

                <div className="rounded-2xl border border-slate-200/70 bg-white/85 px-5 py-10 text-center">

                  <Users
                    size={30}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No people registered yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Add a person to begin a screening.
                  </p>

                  <Link
                    to="/persons/new"
                    className="
                      mt-4 inline-flex
                      items-center gap-2
                      rounded-xl
                      bg-gradient-to-r from-blue-500 to-indigo-600
                      px-4 py-2.5
                      text-xs font-bold text-white
                      transition-all duration-200
                      hover:-translate-y-0.5
                    "
                  >
                    <FilePlus2 size={15} />
                    New Screening
                  </Link>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[760px]">

                    <thead>
                      <tr className="border-b border-slate-200/70">

                        {[
                          'NAME',
                          'AGE',
                          'LOCATION',
                          'LAST SCREENING',
                          'RISK STATUS',
                          'ACTIONS',
                        ].map((title) => (
                          <th
                            key={title}
                            className="
                              px-2 pb-3
                              text-left text-[10px]
                              font-bold tracking-[.11em]
                              text-slate-400
                            "
                          >
                            {title}
                          </th>
                        ))}

                      </tr>
                    </thead>

                    <tbody>

                      {recent.map((person) => {

                        const name = personName(person)

                        return (
                          <tr
                            key={person.id}
                            className="
                              border-b border-slate-200/60
                              transition-colors duration-150
                              hover:bg-white/85
                            "
                          >

                            <td className="px-2 py-3.5">

                              <div className="flex items-center gap-3">

                                <span
                                  className="
                                    grid h-9 w-9
                                    flex-shrink-0 place-items-center
                                    rounded-xl
                                    bg-blue-50
                                    text-[11px] font-extrabold
                                    text-blue-700
                                  "
                                >
                                  {initials(name)}
                                </span>

                                <span
                                  className="
                                    max-w-[180px]
                                    truncate
                                    text-sm font-semibold
                                    text-slate-800
                                  "
                                  title={name}
                                >
                                  {name}
                                </span>

                              </div>
                            </td>

                            <td className="px-2 py-3.5 text-sm text-slate-500">
                              {personAge(person)}
                            </td>

                            <td className="px-2 py-3.5 text-sm text-slate-500">
                              {personLocation(person)}
                            </td>

                            <td className="px-2 py-3.5 text-sm text-slate-500">
                              {personLastScreening(person)}
                            </td>

                            <td className="px-2 py-3.5">
                              <StatusBadge status={personStatus(person)} />
                            </td>

                            <td className="px-2 py-3.5">

                              <div className="flex items-center gap-2">

                                <Link
                                  to={`/persons/${person.id}`}
                                  className="
                                    rounded-lg
                                    bg-slate-100
                                    px-3 py-1.5
                                    text-[11px] font-bold
                                    text-slate-600
                                    transition-all duration-200
                                    hover:-translate-y-0.5
                                  "
                                >
                                  View
                                </Link>

                                <Link
                                  to={`/screening/${person.id}/intro`}
                                  className="
                                    rounded-lg
                                    bg-teal-50
                                    px-3 py-1.5
                                    text-[11px] font-bold
                                    text-teal-700
                                    transition-all duration-200
                                    hover:-translate-y-0.5
                                  "
                                >
                                  Screen
                                </Link>

                              </div>

                            </td>

                          </tr>
                        )
                      })}

                    </tbody>
                  </table>

                </div>
              )}

            </div>
          </GlassCard>

          {/* QUICK ACTIONS */}

          <section
            className="
              overflow-hidden
              rounded-[22px]
              border border-[rgba(148,174,212,0.40)]
              bg-white/90
              p-5
              shadow-[0_10px_32px_rgba(72,102,148,.07)]
              backdrop-blur-xl
            "
          >

            <div className="mb-4 flex items-center gap-2">

              <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <HeartPulse size={17} />
              </span>

              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Quick Actions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Frequently used workflows
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">

              <QuickAction
                href="/persons/new"
                icon={<FilePlus2 size={21} />}
                title="New Screening"
                description="Start a new assessment"
                type="primary"
              />

              <QuickAction
                href="/persons"
                icon={<Users size={21} />}
                title="Manage People"
                description="View and manage patient records"
              />

              <QuickAction
                href="/followups"
                icon={<Clock3 size={21} />}
                title="View Follow-ups"
                description="Check pending actions"
                type="normal"
              />

              <QuickAction
                href="/clinical-evidence"
                icon={<BookOpen size={21} />}
                title="Clinical Evidence"
                description="Explore assessment evidence"
              />

            </div>

          </section>

        </section>

        {/* =================================================
            DISCLAIMER
        ================================================== */}

        <section
          className="
            flex flex-col gap-4
            rounded-[22px]
            border
            border-teal-200/60
            bg-gradient-to-r
            from-teal-50/80
            to-blue-50/70
            px-5 py-4
            shadow-sm
            backdrop-blur-xl
            sm:flex-row sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-start gap-3">

            <span
              className="
                grid h-11 w-11
                flex-shrink-0 place-items-center
                rounded-2xl
                bg-teal-100
                text-teal-700
              "
            >
              <ShieldCheck size={23} />
            </span>

            <div>
              <p className="text-sm font-extrabold text-teal-800">
                Evidence-based screening — not a diagnostic tool
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                BODHIX uses established assessment instruments with predefined
                scoring rules. Results require professional review.
              </p>
            </div>

          </div>

          <Link
            to="/clinical-evidence"
            className="
              inline-flex items-center
              justify-center gap-2
              rounded-xl
              border border-blue-200/70
              bg-white/92
              px-4 py-2.5
              text-xs font-bold text-blue-700
              transition-all duration-200
              hover:-translate-y-0.5
              hover:shadow-md
            "
          >
            Learn More
            <ArrowRight size={15} />
          </Link>

        </section>

      </div>
    </div>
  )
}