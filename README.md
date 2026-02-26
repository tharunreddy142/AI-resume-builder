# AI Resume Builder

AI Resume Builder is a premium, structured web app focused on helping users create a high-quality resume with deterministic scoring, visual templates, and persistent workflow state.

## Detailed Product Description
AI Resume Builder is designed as a practical career-readiness workspace where users can build, evaluate, and improve resumes in one continuous flow. Instead of treating resume creation as a one-time form, the product combines guided authoring, visual rendering, and deterministic quality feedback so users can iterate quickly and confidently.

The product experience starts with a structured resume editor (`/resume`) where each section is intentionally broken down to reduce cognitive load:
- Personal profile and summary for core identity and positioning
- Education and experience for timeline and credibility
- Projects and skills for technical proof and relevance
- External links for portfolio visibility

Skills and projects are implemented with interactive accordions and chip-based editing to support real-world resume writing behavior:
- Skills are categorized into Technical Skills, Soft Skills, and Tools & Technologies
- Projects support title, concise description, tech stack chips, and optional URLs
- Inline guidance nudges users toward stronger bullets and measurable impact

The analysis layer (`/analyze`) is the product’s quality engine:
- Live resume preview rendered in selectable templates (Classic, Modern, Minimal)
- Color customization to tune brand style without changing content quality
- Deterministic ATS scoring that updates as users edit
- Improvement suggestions that identify missing scoring criteria
- Export actions (download/print flow + plain-text copy) for practical application use

Persistence is a core product guarantee:
- Editing state is continuously saved in localStorage
- Template and color preferences are retained across sessions
- App-level state tracks readiness context, including weighted readiness scoring inputs

From a product perspective, this creates a reliable loop:
1. Build resume content
2. Analyze score and suggestions
3. Refine weak areas
4. Export and apply

The result is a resume workflow that is structured, measurable, and fast to iterate, with enough scaffolding to expand into job matching, applications tracking, dashboard analytics, and settings without breaking the existing user model.

## Product Vision
The product is designed around three principles:
- Clarity: users always see what they have built and what is missing.
- Structure: every section is guided and editable with consistent form patterns.
- Persistence: progress is saved continuously and restored reliably.

## Route Architecture
The app uses a route rail for end-to-end workflow separation:
- `/` -> Home landing
- `/jobs` -> Jobs scaffold (placeholder page)
- `/analyze` -> Resume preview, ATS score, export tools
- `/resume` -> Main resume builder
- `/applications` -> Applications scaffold (placeholder page)
- `/dashboard` -> Dashboard scaffold (placeholder page)
- `/settings` -> Settings scaffold (placeholder page)
- `/proof` -> Proof scaffold (placeholder page)

Compatibility redirects are maintained:
- `/builder` -> `/resume`
- `/preview` -> `/analyze`

## UI/UX Design System
The app follows a calm premium design language with reusable token-driven styles.

### Visual Direction
- Clean typography hierarchy
- Controlled spacing and card-based composition
- Non-flashy interactions
- Template-driven resume rendering
- Accent color customization with consistent application

### Top-Level Layout
- Persistent top navigation
- Context header for primary pages
- Main content with builder/preview split where needed
- Scaffolds for future modules to preserve route stability

## Resume Builder Design (`/resume`)
The builder is intentionally sectioned and structured:

### Core Sections
- Personal Info
- Summary
- Education (multi-entry)
- Experience (multi-entry, bullet guidance)
- Skills (category-based chips)
- Projects (accordion entries with tech stack chips)
- Links (GitHub, LinkedIn)

### Skills Section
Three grouped categories with chip input and removable tags:
- Technical Skills
- Soft Skills
- Tools & Technologies

Additional behavior:
- Enter key adds a chip
- X removes a chip
- Category count in label
- `✨ Suggest Skills` auto-populates curated skills with loading state

### Projects Section
Accordion project editor with:
- Add Project
- Collapsible project cards
- Project title, description (200 char max + counter)
- Tech stack chip input
- Optional live URL and GitHub URL
- Per-project delete

## Resume Preview Design (`/analyze`)
The preview page is both presentation and quality-check layer.

### Template System
Three selectable templates:
- Classic: single-column, serif-forward, ruled sections
- Modern: two-column with accent sidebar + content panel
- Minimal: borderless, airy spacing, sans-serif focus

Template switch re-renders layout and typography only; content remains unchanged.

### Color Theme System
Five theme options:
- Teal
- Navy
- Burgundy
- Forest
- Charcoal

Accent color affects template-specific visual accents such as:
- Section headings
- Rules/borders
- Modern sidebar background

### Visual Picker Components
- Template thumbnails (120px cards)
- Active template blue border + check indicator
- Color dot picker with active outline

## Scoring and Quality Logic
The app contains deterministic scoring, no AI scoring path.

### ATS Resume Score
ATS score updates live from resume form state and is shown in preview as a circular meter with states:
- 0-40: Needs Work
- 41-70: Getting There
- 71-100: Strong Resume

Suggestions list shows missing criteria that increase score.

### Weighted Readiness Score Model
Persisted readiness model weights:
- Job Match Quality: 30%
- JD Skill Alignment: 25%
- Resume ATS Score: 25%
- Application Progress: 10%
- Practice Completion: 10%

This is stored in app state under `readinessScore` with computed components.

## Export Design
Export actions are on `/analyze`:
- Download PDF
  - Triggers print flow
  - Toast confirmation shown
- Copy Resume as Text
  - Structured plain-text export format
  - Clipboard API + fallback copy strategy

### Print Behavior
Print mode emphasizes document output quality:
- Hide navigation and non-resume UI
- White background, clean spacing
- Page-break controls to avoid awkward bullet splits

## Guidance and Validation Philosophy
The app uses non-blocking guidance:
- Bullet quality suggestions (action verbs, measurable impact)
- Export warning when critical resume parts are missing
- User input is never blocked for advisory checks

## Persistence & State Model
Primary persistence key:
- `resumeBuilderAppState`

Backward-compatible keys retained:
- `resumeBuilderData`
- `resumeBuilderTemplate`
- `resumeBuilderAccentColor`

Persisted shape:
```js
{
  preferences,
  resumeData,
  jobMatches,
  applications,
  jdAnalyses,
  readinessScore,
  lastActivity
}
```

## Technical Implementation
- React + React Router
- Vite build system
- CSS-based design tokens and component styles
- No heavy UI framework dependency
- Deterministic client-side scoring and persistence

## Current Module Status
Implemented fully:
- Home, Resume Builder, Analyze/Preview core workflows
- Template + color customization
- ATS meter and guidance
- Export actions and print profile
- App state persistence

Scaffolded for next phase:
- Jobs
- Applications
- Dashboard
- Settings
- Proof

## Local Development
Install dependencies:
```bash
npm install
```

Start dev server:
```bash
npm run dev
```

Create production build:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Notes
This README documents the current product architecture and design decisions so the project can scale route-by-route without breaking existing user data or UX consistency.
