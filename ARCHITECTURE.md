# AI Interview Prep Platform Architecture

## Route Map
- `/` marketing landing page
- `/login` sign in
- `/register` sign up
- `/dashboard` authenticated dashboard
- `/applications` application tracker
- `/applications/[applicationId]` job-specific prep workspace
- `/question-bank` saved and generated question library
- `/mock` mock interview index
- `/mock/[sessionId]` mock interview session
- `/api/auth/[...nextauth]` authentication handlers
- `/api/applications` list and create applications
- `/api/applications/[id]` update and delete applications
- `/api/notes` list and create preparation notes
- `/api/resumes/upload` upload resume files
- `/api/ai/questions` create a generated question set
- `/api/ai/feedback` score a mock interview response

## Prisma Model Updates
- `JobDescription` is now a dedicated model attached to `JobApplication` by `applicationId`.
- `QuestionSet` is the parent collection for generated or imported questions.
- `Question` belongs to `QuestionSet` instead of attaching loosely to applications.
- `PrepNote` now supports job-specific preparation through `applicationId` and `noteType`.

## Dashboard MVP Data Contract
- `totalApplications`
- `countsByStatus`
- `recentApplications`
- `recentInterviewSessions`
- `totalGeneratedQuestions`

This contract is represented in [lib/dashboard.ts](/Users/beyondshaw/Documents/New%20project/ai-interview-prep-platform/lib/dashboard.ts).

## MVP Milestones
1. App shell, route groups, and reusable UI foundation
2. Prisma schema, seed setup, env config, and auth foundation
3. Application tracker CRUD with normalized application-related models
4. Dashboard queries using the explicit MVP data contract
5. Resume upload, job description ingestion, question set generation, and note workflows
6. Mock session flow and AI feedback using the normalized models above
