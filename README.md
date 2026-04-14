# AI Interview Prep Platform

A production-style full-stack web application for tracking job applications, generating role-aware interview questions, and practicing mock interviews in a single authenticated workspace.

## Project Overview
AI Interview Prep Platform helps candidates turn a fragmented job search into a structured preparation workflow. Instead of splitting applications, job descriptions, notes, generated questions, and interview practice across multiple tools, the app brings everything into one system tied to each role.

The product is built around a practical user problem: most candidates know where they applied, but struggle to prepare consistently for each opportunity. This project makes every application a preparation unit with its own role context, study material, and practice history.

It is useful because it combines operational tracking with preparation depth. Users can see where they are in the hiring pipeline, generate targeted questions, run mock sessions, save answers, and return later without losing context.

## Core Features
- Job application tracking with CRUD flows and status updates from wishlist to offer
- Dedicated job description records and job-specific prep notes
- AI-assisted question generation with a graceful fallback when OpenAI is not configured
- Mock interview sessions with saved answers, persisted progress, and completion state
- Dashboard metrics for applications, status counts, recent activity, and generated question volume
- Authentication, protected routes, and user ownership checks across data access
- Multilingual UI support with `next-intl` for `en`, `zh`, `es`, `hi`, and `ar`

## Demo Flow
1. Sign in or create an account.
2. Create a new job application with company, role, and status.
3. Open the application detail page and add a job description.
4. Generate a question set for that application.
5. Review the generated questions in the Question Bank.
6. Start a mock interview session from a question set.
7. Save answers question by question and show progress tracking.
8. Return to the dashboard to show recent applications, recent sessions, and aggregate metrics.
9. Switch the interface language from the header to demonstrate multilingual support.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL / Supabase
- Auth.js
- Vercel
- `next-intl`
- Vitest

## Architecture Overview
The app is intentionally monolithic, but organized around explicit domain models and normalized relationships.

- `User`
  - Owns applications, question sets, interview sessions, resumes, and prep notes
- `JobApplication`
  - Central record for company, role, status, and related preparation data
- `JobDescription`
  - Dedicated normalized record for application-specific job description text
- `QuestionSet`
  - A generated or saved batch of interview questions, optionally linked to an application
- `Question`
  - Individual prompt inside a `QuestionSet`, with category, difficulty, and source metadata
- `InterviewSession`
  - A mock interview run started from a `QuestionSet`, optionally linked back to an application
- `InterviewResponse`
  - A persisted answer to a specific question within a specific session
- `PrepNote`
  - Job-specific notes for research, strategy, company context, and answer drafts

## Key Engineering Decisions
- Normalized relational schema
  - `JobDescription`, `QuestionSet`, `Question`, `InterviewSession`, and `InterviewResponse` are modeled as dedicated entities instead of being loosely embedded in broader records.
- Ownership-safe access patterns
  - Server-side queries and mutations scope records to the authenticated user before reading or writing data.
- Graceful AI fallback
  - Question generation uses OpenAI when available, but the app remains demoable and functional without AI credentials by creating a starter question set.
- Persisted mock session state
  - Mock sessions and answers are stored in the database, allowing users to resume, revise, and complete sessions over time.
- Multilingual UI with locale fallback
  - `next-intl` powers localized UI text, browser locale detection, and fallback to English when a translation is unavailable.
- Locale consistency check
  - A lightweight `npm run i18n:check` script keeps locale files in sync with `messages/en.json` to prevent missing-key regressions.
- Focused automated tests
  - The project includes a small, high-value test layer around critical flows such as validation, application creation, question generation fallback, and mock answer persistence.

## Local Development
### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a local `.env` file based on `.env.example`.

Required:
```bash
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=http://localhost:3000
```

Optional:
```bash
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=
```

### 3. Generate Prisma client and sync the database
```bash
npm run db:generate
npm run db:push
```

### 4. Seed demo data
```bash
npm run db:seed
```

### 5. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Run tests
```bash
npm test
```

### 7. Run the locale consistency check
```bash
npm run i18n:check
```

## Deployment
This project is designed to deploy cleanly on Vercel with a Postgres-compatible database such as Supabase.

### Recommended setup
- Next.js app on Vercel
- PostgreSQL database on Supabase
- Optional Supabase Storage for future resume upload support

### Required environment variables
```bash
DATABASE_URL
AUTH_SECRET
AUTH_URL
```

### Optional environment variables
```bash
OPENAI_API_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
```

### Deployment notes
- Run `npm run db:generate` in your deployment workflow if needed
- Run `npm run db:push` against the target database before first production use
- If `OPENAI_API_KEY` is not configured, question generation still works through the built-in fallback path

## Future Improvements
- Resume upload and text extraction to improve resume-based question quality
- Stronger inline form-level validation feedback
- Richer mock session summary and review UX
- Optional analytics around preparation velocity and practice history
- More polished file upload flow for resumes

## Why This Project Is Portfolio-Ready
- End-to-end full-stack product flow rather than isolated feature demos
- Real authentication, protected routes, and server-side ownership checks
- Clear relational modeling with Prisma and PostgreSQL
- Practical AI integration with a non-breaking fallback path
- Persisted mock interview workflow instead of temporary client-only state
- Multilingual UI support with automated locale consistency validation
- Clean local setup, testability, and straightforward deployment to Vercel + Supabase
