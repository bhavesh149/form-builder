# Frontend — React + TypeScript

The frontend is a **React 19** single-page application built with Vite and TypeScript. It provides a modern, responsive UI for creating dynamic safety forms, submitting responses, and managing submissions.

---

## Tech Stack

| Technology              | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| React 19                | UI framework                                     |
| TypeScript              | Type safety                                      |
| Vite                    | Build tool & dev server (HMR)                    |
| Tailwind CSS v4         | Utility-first styling with CSS variable theming   |
| Zustand                 | Lightweight state management (form builder store) |
| TanStack React Query    | Server state, caching, and data fetching         |
| React Router DOM v7     | Client-side routing                              |
| Framer Motion           | Animations, transitions, parallax effects        |
| @dnd-kit                | Drag-and-drop (palette → canvas, field reordering) |
| Axios                   | HTTP client                                      |
| Lucide React            | Icon library                                     |
| Sonner                  | Toast notifications                              |
| React Dropzone          | File/video upload drag area                      |
| clsx + tailwind-merge   | Conditional class name composition               |

---

## Project Structure

```
frontend/src/
├── main.tsx                      # App entry point
├── App.tsx                       # Router setup, auth guards, lazy loading
├── index.css                     # Tailwind @theme (CSS variables), global styles
│
├── api/
│   ├── client.ts                 # Axios instance with JWT interceptor
│   └── index.ts                  # Typed API functions (forms, submissions, auth, metadata, uploads)
│
├── components/
│   ├── Pagination.tsx            # Reusable server-side pagination control
│   ├── BranchManagerModal.tsx    # Admin modal for managing branches
│   │
│   ├── form-builder/             # Form creation UI
│   │   ├── FieldPalette.tsx      # Draggable field types list + form settings
│   │   ├── FormCanvas.tsx        # Drop zone with sortable field cards
│   │   ├── FieldConfigPanel.tsx  # Tabbed panel: Settings, Logic (per-field), All Rules
│   │   └── LogicRulesModal.tsx   # Full-screen logic rule builder/editor
│   │
│   ├── form-renderer/
│   │   └── DynamicFieldRenderer.tsx  # Renders any FormField as the appropriate input
│   │
│   └── layout/
│       └── AppLayout.tsx         # Sidebar navigation, responsive collapse, logout modal
│
├── context/
│   └── AuthContext.tsx            # JWT auth context (login, logout, token refresh)
│
├── hooks/
│   ├── useDebounce.ts            # Generic debounce hook
│   ├── useDraftSave.ts           # Auto-save draft to localStorage
│   └── useLogicEngine.ts         # Evaluates logic rules against form data in real-time
│
├── lib/
│   └── utils.ts                  # cn() helper (clsx + tailwind-merge)
│
├── pages/
│   ├── LandingPage.tsx           # Public landing page with animations
│   ├── LoginPage.tsx             # Auth: login
│   ├── RegisterPage.tsx          # Auth: register
│   ├── DashboardPage.tsx         # Form list with search, pagination, stats
│   ├── FormBuilderPage.tsx       # 3-panel form builder (palette, canvas, config)
│   ├── FormPreviewPage.tsx       # Read-only form preview with dynamic data sources
│   ├── FormSubmitPage.tsx        # Public form submission with thank-you screen
│   ├── SubmissionsListPage.tsx   # Paginated submissions table
│   └── SubmissionDetailPage.tsx  # Individual submission detail view
│
├── store/
│   └── formBuilderStore.ts       # Zustand store: fields, logic rules, metadata
│
└── types/
    └── index.ts                  # Shared TypeScript interfaces (Form, Submission, etc.)
```

---

## Key Features

- **Drag-and-Drop Form Builder** — Drag field types from the palette onto the canvas. Reorder fields by dragging. Three-panel layout: palette, canvas, config.
- **Logic Rules Engine** — Create IF/THEN rules with smart value inputs (dropdowns for option fields, number inputs for number fields). Operators are filtered by field type. Rules are editable inline. Supports checkbox group `includes`/`excludes`.
- **Dynamic Data Sources** — Select fields can be backed by API endpoints. The renderer fetches and populates options at runtime.
- **Responsive Design** — Collapsible sidebar, mobile card views for tables, overlay panels on small screens.
- **Server-Side Pagination** — Dashboard and submissions list use `skip`/`limit` with total counts from the API.
- **Debounced Search** — Search input on dashboard is debounced (350ms) to avoid excessive API calls.
- **Theming** — CSS variables via Tailwind v4 `@theme` block. Sand/gold palette applied globally.

---

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and expects the backend at `http://localhost:8000`.

---

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |
