# Collect Anything — Product Requirements Document (PRD)

## Overview

- **Purpose:** Provide a no-code platform for teams to create data-collection projects (custom forms, validations, storage, exports, basic analytics).
- **Target users:** Admins at schools, NGOs, small businesses, researchers who need ad-hoc data collection without coding.
- **Primary value:** Fast creation of forms and projects with re-usable components, immediate data capture, role-based access, and simple exports.

## Goals

- **User goal:** Create a project and form, collect submissions, and export/analyze results without developer help.
- **Business goal:** Ship an MVP in 6–8 weeks enabling 3 common templates (attendance, payments, inventory) and onboard 3 pilot customers.
- **Success metrics:** Time-to-form creation <10 min, signup→created project ≥30%, retention (monthly active projects) ≥40%.

## Personas & Use Cases

- **School Admin:** Create "Insurance Payments" form with fields: Student Name, Class, Date, Is Paid (boolean), Receipt Image.
- **Field Enumerator:** Use mobile to submit form responses offline → sync later.
- **Program Manager:** View submissions, filter, export CSV, basic aggregate (counts / sums).

## MVP Scope (must-haves)

- **Project management:** Create / update / delete projects.
- **Form builder:** Drag/drop or list-driven builder with components: Short text, Long text, Number, Date, Time, Dropdown, Radio, Checkbox, Boolean toggle, File upload (image/pdf).
- **Field options:** Label, placeholder, required, default, validation rules (regex, min/max), help text.
- **Form rendering:** Next.js frontend renders forms responsively; mobile-friendly.
- **Submissions:** Store submissions as JSON per form; attachments stored as files with references.
- **User & roles:** Admin, Editor, Viewer at project level.
- **Exports & search:** CSV export, basic filtering by field and date range.
- **Auth:** Email/password + session; invite via email.
- **Audit log:** Record project/form changes and submission creation (basic).

## Nice-to-have (post-MVP)

- Conditional logic, calculated fields, repeatable groups, templates marketplace, advanced analytics (charts), offline-first PWA, SSO (SAML/OIDC), webhooks and integrations.

## Technical Stack

- **Frontend:** Next.js (app router), shadcn/ui for components, lucide icons, TypeScript, Tailwind CSS.
- **Backend:** FastAPI, SQLModel for ORM, SQLite for MVP (migrate to Postgres later).
- **Python env:** use `uv` to manage virtual env and packages.
- **Server:** Uvicorn (development); containerized or ASGI server for production.
- **Storage:** Local disk for attachments (S3-compatible later).
- **API:** RESTful JSON (optional GraphQL later).

## High-level Architecture

- Frontend (Next.js) calls Backend (FastAPI) over HTTPS.
- Backend exposes auth, project, form, field, submission, and file upload endpoints.
- DB stores normalized models (Project, Form, Field, Submission, User, Role, Audit).
- Attachments saved to disk or object storage with signed URLs.

## Data Model (concise)

- **User:** id, email, hashed_password, name, created_at.
- **Project:** id, owner_id, title, description, settings, created_at.
- **Form:** id, project_id, title, slug, schema (ordered fields JSON), settings.
- **Field:** (embedded in schema) id, type, label, key, validation, options.
- **Submission:** id, form_id, project_id, data(JSON), attachments(metadata), submitted_by, created_at.
- **Role:** project_id, user_id, role.

## Example API Endpoints

- **Auth:** POST `/api/auth/signup`, POST `/api/auth/login`, POST `/api/auth/invite`
- **Projects:** GET `/api/projects`, POST `/api/projects`, GET `/api/projects/{id}`
- **Forms:** GET `/api/projects/{p}/forms`, POST `/api/projects/{p}/forms`, GET `/api/forms/{id}`
- **Submissions:** POST `/api/forms/{id}/submissions`, GET `/api/forms/{id}/submissions`
- **Files:** POST `/api/uploads` (multipart), GET `/api/uploads/{id}` (signed URL)
- **Export:** GET `/api/forms/{id}/export?format=csv&filters=...`

## Frontend UX / Flows

- **Onboarding:** Signup → create first project → create form (template or blank).
- **Form builder:** Add component → configure props → preview → save/publish.
- **Form use:** Public form link or project-restricted form; mobile-first form UI.
- **Admin:** Project dashboard shows newest submissions, quick-export, manage team invites.

## Validation & Error Handling

- Client-side validation per field + server-side validation using field schema.
- Clear user-facing error messages for save/fail operations.
- Rate limit public form submissions to prevent abuse.

## Security & Privacy

- **Auth:** hashed passwords (bcrypt/argon2), session cookies or JWT with refresh tokens.
- **Access control:** RBAC at project level; enforce on every API call.
- **Data protection:** HTTPS in transit; encryption at rest for attachments (future).
- **Privacy:** Allow project owners to delete data; retention policy configurable.
- **Compliance:** Design to support GDPR access/delete requests.

## Non-Functional Requirements

- **Availability:** 99.5% for core API (post-MVP).
- **Performance:** API respond <300ms for typical queries; form render <1s.
- **Scale plan:** Start SQLite for MVP; provide migration path & tests for Postgres.
- **Backups:** Daily DB and attachments backups (post-MVP).

## Testing & QA

- Unit tests for backend models and API (pytest), integration tests for key flows (create form, submit, export).
- E2E tests (Playwright) for builder → publish → submit → export.
- CI pipeline to run lint (black/isort/ruff), tests, and type checks.

## MVP Roadmap & Milestones

- **Week 0–1:** Project setup, repo scaffolding, auth, basic projects API.
- **Week 2–4:** Form builder backend model + frontend builder UI, form rendering, submissions storage.
- **Week 5–6:** File uploads, exports, role-based access, basic analytics, docs.
- **Week 7–8:** QA, pilot onboarding, iterate based on feedback, harden for production.

## Acceptance Criteria

- **Create form:** Non-technical user can create and publish a form in ≤10 minutes.
- **Collect data:** Submissions persist and are retrievable and exportable to CSV.
- **Permissions:** Project Admin can invite users and set roles.
- **Validation:** Required fields and basic rules are enforced on client and server.
- **Test coverage:** Core flows covered by unit/integration tests; CI passes.

## Risks & Mitigations

- **Schema complexity:** Keep field schema simple JSON; migrate with versioning.
- **Attachment scaling:** Use S3 early if expecting many files.
- **Offline support:** Complex—defer to post-MVP.

## Appendix — Common Form Components (MVP)

- **Text (single-line)**, **Textarea**, **Number**, **Date**, **Time**, **Select**, **Radio**, **Checkbox**, **Toggle (boolean)**, **File Upload**, **Hidden (for metadata)**.

---

If you want, I can also scaffold initial backend models and API routes next.
