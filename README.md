# DementiaScreen — Early Cognitive Screening & Monitoring System

A full-stack platform that helps a trained community health worker conduct structured cognitive
screenings, track people over time, and prioritize follow-up care.

> **This is a research-inspired educational software project and not a medical diagnostic
> system.** It never displays a diagnosis. Every result is framed as "Low Concern" or "Review
> Recommended," with a recommendation that a qualified healthcare professional interpret it.

---

## 1. Problem statement

Dementia is frequently under-detected in resource-limited settings where specialist assessment is
scarce. Structured, brief instruments (AD8, RUDAS, PFAQ) let trained non-specialist health workers
flag people who may benefit from further professional evaluation. DementiaScreen digitizes that
workflow: registration → structured screening → transparent scoring → history tracking → follow-up
prioritization → aggregate reporting.

## 2. Research inspiration

Inspired by 2025 CHI-recognized mHealth research on dementia screening in resource-limited
settings. This project does **not** reproduce that research's proprietary content — see the
medical disclaimer below.

## 3. Important medical disclaimer

- The system is a **screening / decision-support tool only.**
- It **never** states "you have dementia," "you don't have dementia," or any definitive diagnosis.
- All AD8 / RUDAS / PFAQ question wording in `database/seed.sql` is **placeholder text**
  (`[Validated ... item will be inserted here]`), because the actual validated instrument wording
  and official scoring cutoffs are licensed/copyrighted content this project does not have
  authorization to reproduce. Scoring is fully data-driven (see `assessment_sections` and
  `questions` tables), so an authorized deployer can swap in the real wording, options, and
  cutoffs without touching backend code.
- Every result screen shows: *"Further professional assessment may be appropriate."*

## 4. Features

- Role-based access: **Health Worker** (register people, screen, view results/history, manage
  follow-ups) and **Admin** (aggregate dashboard, anonymized statistics).
- Person registration with consent capture.
- Three-instrument screening flow (AD8 → RUDAS → PFAQ), one question at a time, with progress
  indicator.
- Configurable scoring engine (`ScreeningScoringService`) driven entirely by database rows.
- Per-person screening history and a visual progress timeline.
- Transparent, rule-based follow-up **priority engine** (High / Medium / Low) that always shows
  *why* someone was prioritized.
- Follow-up lifecycle: Pending → Scheduled → Completed / Overdue.
- Privacy-conscious analytics dashboard (aggregate counts only, no per-person medical detail).
- Offline-style screening capture: screenings taken without connectivity queue in the browser and
  sync only once the backend confirms receipt.
- JWT authentication, BCrypt password hashing, role-based authorization, centralized error
  handling (no stack traces leaked to the client).

## 5. Unique features (project-level, not from the original research)

- **Screening history** across multiple visits per person.
- **Progress visualization** (line chart + timeline).
- **Follow-up management** with four explicit states.
- **Transparent priority engine** built with a Java `PriorityQueue` (max-heap) plus a `HashMap`
  for O(1) question lookups during scoring and an `ArrayList`-based chronological history used for
  trend comparison — see `backend/.../dsa/`.
- **Offline data capture** with an explicit pending-sync counter.
- **Localization-ready** UI (language switcher scaffolded; English only for now).

## 6. Technology stack

| Layer     | Stack |
|-----------|-------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router, Recharts |
| Backend   | Java 17, Spring Boot 3 (Web, Data JPA, Security, Validation), Maven |
| Database  | MySQL 8, normalized relational schema |
| Auth      | JWT (jjwt), BCrypt password hashing |

## 7. Architecture

```
React (Vite)  ─── REST/JSON ───►  Spring Boot  ─── JPA/Hibernate ───►  MySQL
   │                                   │
   ├─ authContext (JWT in localStorage)│
   └─ offlineContext (pending queue)   ├─ controller → service → repository → entity
                                       ├─ dto (request/response shapes)
                                       ├─ security (JwtService, JwtAuthFilter, SecurityConfig)
                                       ├─ exception (GlobalExceptionHandler)
                                       └─ dsa (PriorityRanker, TrendAnalyzer)
```

## 8. Database design

See `database/schema.sql`. Key relationships:

- `persons` 1—N `screenings` 1—N `answers`
- `screenings` 1—N `screening_results` (one row per instrument section)
- `persons` 1—N `screening_history` (denormalized snapshot per screening, for fast timelines)
- `persons` 1—N `follow_ups`
- `assessment_sections` 1—N `questions` (scoring rules kept data-driven/configurable)

## 9. API list

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/persons` | Register a person |
| GET | `/api/persons?q=` | List / search people |
| GET | `/api/persons/{id}` | Person detail |
| GET | `/api/persons/{id}/history` | Screening history timeline |
| GET | `/api/screenings/questions/{sectionCode}` | Questions for AD8/RUDAS/PFAQ |
| POST | `/api/screenings` | Submit a completed screening, returns computed result |
| POST | `/api/followups` | Create a follow-up |
| GET | `/api/followups` | List follow-ups |
| PATCH | `/api/followups/{id}/status` | Update follow-up status |
| GET | `/api/followups/priority` | Ranked priority list |
| GET | `/api/dashboard/statistics` | Dashboard summary counts |
| GET | `/api/analytics` | Aggregate analytics |

## 10. DSA usage

- **`PriorityQueue`** (`dsa/PriorityRanker.java`) — max-heap keyed by a transparent rule-based
  score, used to rank people needing follow-up without re-sorting the full list on every update.
- **`HashMap`** (`ScreeningScoringService`) — O(1) question lookup by ID while scoring a
  multi-instrument submission.
- **`ArrayList`** (`ScreeningHistory` queries, `dsa/TrendAnalyzer.java`) — chronologically ordered
  history, cheap to append to and walk sequentially for timeline rendering and trend comparison.
- **Sorting** — dashboard "recent people" list and priority output are sorted by recency/score.
- **Searching/filtering** — `PersonService.search()` filters people by name.

Every use above is commented in code explaining *why* that structure fits the access pattern,
per the project brief (no DSA included just to check a box).

## 11. Installation

### Prerequisites
- Java 17+, Maven 3.9+
- Node.js 18+
- MySQL 8+

### Database setup
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Backend
```bash
cd backend
cp .env.example .env   # then edit with your local MySQL credentials + a real JWT secret
export $(cat .env | xargs)   # or configure these as real environment variables
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`.

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## 12. Test login credentials (DEMO DATA ONLY)

| Role | Email | Password |
|---|---|---|
| Health Worker | `worker1@dementiascreen.demo` | `Password123!` |
| Health Worker | `worker2@dementiascreen.demo` | `Password123!` |
| Admin | `admin@dementiascreen.demo` | `Password123!` |

All seeded people (Fictional Person A–J) are clearly fictional demo data.

## 13. Known limitations

- AD8 / RUDAS / PFAQ question wording and scoring cutoffs are **placeholders**. Real deployment
  requires inserting officially licensed instrument content into the `questions` and
  `assessment_sections` tables.
- Admin "manage health workers" UI is not yet built (accounts are managed via SQL/seed scripts).
- "Forgot password" is a UI stub only; no email delivery is wired up.
- Offline mode uses browser `localStorage` for the pending queue; it is not encrypted at rest and
  is scoped to a single browser/device.
- No automated test suite yet.
- Localization scaffolding exists in Settings, but only English strings are implemented.

## 14. Next recommended improvements

1. Insert real, licensed AD8/RUDAS/PFAQ content and validated cutoffs.
2. Add automated backend (JUnit) and frontend (Vitest) tests, especially around scoring logic.
3. Build the admin health-worker management screen.
4. Add refresh tokens / session expiry handling in the frontend.
5. Encrypt the offline queue and add conflict resolution for concurrent edits.
6. Add real i18n (react-i18next) once additional languages are prioritized.
