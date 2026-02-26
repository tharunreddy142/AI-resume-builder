import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'resumeBuilderData'
const TEMPLATE_KEY = 'resumeBuilderTemplate'
const ACCENT_KEY = 'resumeBuilderAccentColor'
const APP_STATE_KEY = 'resumeBuilderAppState'
const READINESS_WEIGHTS = {
  jobMatchQuality: 30,
  jdSkillAlignment: 25,
  resumeAtsScore: 25,
  applicationProgress: 10,
  practiceCompletion: 10,
}
const ACCENT_COLORS = [
  { name: 'Teal', value: 'hsl(168, 60%, 40%)' },
  { name: 'Navy', value: 'hsl(220, 60%, 35%)' },
  { name: 'Burgundy', value: 'hsl(345, 60%, 35%)' },
  { name: 'Forest', value: 'hsl(150, 50%, 30%)' },
  { name: 'Charcoal', value: 'hsl(0, 0%, 25%)' },
]
const ACTION_VERBS = [
  'Built',
  'Developed',
  'Designed',
  'Implemented',
  'Led',
  'Improved',
  'Created',
  'Optimized',
  'Automated',
]

const emptyResume = {
  personal: { name: '', email: '', phone: '', location: '' },
  summary: '',
  education: [{ school: '', degree: '', start: '', end: '' }],
  experience: [{ company: '', role: '', start: '', end: '', details: '' }],
  projects: [{ title: '', description: '', techStack: [], liveUrl: '', githubUrl: '' }],
  skills: {
    technical: [],
    soft: [],
    tools: [],
  },
  links: { github: '', linkedin: '' },
}

const sampleResume = {
  personal: {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+1 555-104-3301',
    location: 'San Jose, CA',
  },
  summary:
    'Frontend engineer with 3+ years building recruiter workflows. Improved application review throughput by 35%, shipped reusable resume parsing components, and collaborated closely with product and design to deliver faster iteration cycles and cleaner candidate experiences.',
  education: [{ school: 'State University', degree: 'B.S. Computer Science', start: '2019', end: '2023' }],
  experience: [
    {
      company: 'Northlane Tech',
      role: 'Software Engineer',
      start: '2023',
      end: 'Present',
      details: 'Improved conversion by 22% using A/B experiments.\nBuilt internal automation that reduced processing time by 2x.',
    },
  ],
  projects: [
    {
      title: 'TaskFlow',
      description: 'Built collaborative tracker used by 2k+ users with weekly reports.',
      techStack: ['React', 'Node.js'],
      liveUrl: 'https://taskflow.example.com',
      githubUrl: 'https://github.com/aaravsharma/taskflow',
    },
    {
      title: 'Resume Lens',
      description: 'Optimized keyword insights and improved relevance score by 18%.',
      techStack: ['TypeScript', 'PostgreSQL'],
      liveUrl: '',
      githubUrl: 'https://github.com/aaravsharma/resume-lens',
    },
  ],
  skills: {
    technical: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
    soft: ['Team Leadership', 'Problem Solving'],
    tools: ['Git', 'Docker', 'AWS'],
  },
  links: {
    github: 'github.com/aaravsharma',
    linkedin: 'linkedin.com/in/aaravsharma',
  },
}

function toSkillArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => `${item || ''}`.trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function normalizeSkills(rawSkills) {
  if (!rawSkills || typeof rawSkills !== 'object') {
    return { technical: [], soft: [], tools: [] }
  }

  if (typeof rawSkills === 'string') {
    return {
      technical: toSkillArray(rawSkills),
      soft: [],
      tools: [],
    }
  }

  return {
    technical: toSkillArray(rawSkills.technical),
    soft: toSkillArray(rawSkills.soft),
    tools: toSkillArray(rawSkills.tools),
  }
}

function normalizeProject(item) {
  return {
    title: item?.title || item?.name || '',
    description: item?.description || '',
    techStack: toSkillArray(item?.techStack || item?.tech),
    liveUrl: item?.liveUrl || '',
    githubUrl: item?.githubUrl || '',
  }
}

function normalizeResume(raw) {
  if (!raw || typeof raw !== 'object') return emptyResume

  return {
    personal: {
      name: raw.personal?.name || '',
      email: raw.personal?.email || '',
      phone: raw.personal?.phone || '',
      location: raw.personal?.location || '',
    },
    summary: raw.summary || '',
    education:
      Array.isArray(raw.education) && raw.education.length > 0
        ? raw.education.map((item) => ({
            school: item?.school || '',
            degree: item?.degree || '',
            start: item?.start || '',
            end: item?.end || '',
          }))
        : [{ school: '', degree: '', start: '', end: '' }],
    experience:
      Array.isArray(raw.experience) && raw.experience.length > 0
        ? raw.experience.map((item) => ({
            company: item?.company || '',
            role: item?.role || '',
            start: item?.start || '',
            end: item?.end || '',
            details: item?.details || '',
          }))
        : [{ company: '', role: '', start: '', end: '', details: '' }],
    projects:
      Array.isArray(raw.projects) && raw.projects.length > 0
        ? raw.projects.map(normalizeProject)
        : [{ title: '', description: '', techStack: [], liveUrl: '', githubUrl: '' }],
    skills: normalizeSkills(raw.skills),
    links: {
      github: raw.links?.github || '',
      linkedin: raw.links?.linkedin || '',
    },
  }
}

function normalizeTemplate(raw) {
  if (raw === 'classic' || raw === 'modern' || raw === 'minimal') return raw
  return 'classic'
}

function normalizeAccentColor(raw) {
  const fallback = ACCENT_COLORS[0].value
  const isValid = ACCENT_COLORS.some((item) => item.value === raw)
  return isValid ? raw : fallback
}

function getAllSkills(data) {
  return [...data.skills.technical, ...data.skills.soft, ...data.skills.tools]
}

function isEducationPopulated(item) {
  return Boolean(item.school.trim() || item.degree.trim() || item.start.trim() || item.end.trim())
}

function isExperiencePopulated(item) {
  return Boolean(
    item.company.trim() || item.role.trim() || item.start.trim() || item.end.trim() || item.details.trim(),
  )
}

function isProjectPopulated(item) {
  return Boolean(
    item.title.trim() || item.description.trim() || item.techStack.length > 0 || item.liveUrl.trim() || item.githubUrl.trim(),
  )
}

function hasNumber(text) {
  return /\d+\s*(%|x|k|m)?/i.test(text)
}

function extractBullets(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[\-•*\d.)\s]+/, '').trim())
    .filter(Boolean)
}

function startsWithActionVerb(text) {
  const regex = new RegExp(`^(${ACTION_VERBS.join('|')})\\b`, 'i')
  return regex.test(text)
}

function evaluateBullets(text) {
  return extractBullets(text).map((line, index) => ({
    index,
    text: line,
    hasVerb: startsWithActionVerb(line),
    hasNumber: hasNumber(line),
  }))
}

function calculateResumeScore(data) {
  const checks = []
  const summary = data.summary.trim()
  const actionVerbRegex = new RegExp(`\\b(${ACTION_VERBS.join('|')})\\b`, 'i')
  const hasExperienceWithBullets = data.experience.some(
    (item) => isExperiencePopulated(item) && extractBullets(item.details).length > 0,
  )

  checks.push({
    passed: Boolean(data.personal.name.trim()),
    points: 10,
    suggestion: 'Add your full name (+10 points).',
  })
  checks.push({
    passed: Boolean(data.personal.email.trim()),
    points: 10,
    suggestion: 'Add an email address (+10 points).',
  })
  checks.push({
    passed: summary.length > 50,
    points: 10,
    suggestion: 'Add a professional summary (+10 points).',
  })
  checks.push({
    passed: hasExperienceWithBullets,
    points: 15,
    suggestion: 'Add at least one experience entry with bullet points (+15 points).',
  })
  checks.push({
    passed: data.education.some(isEducationPopulated),
    points: 10,
    suggestion: 'Add at least one education entry (+10 points).',
  })
  checks.push({
    passed: getAllSkills(data).length >= 5,
    points: 10,
    suggestion: 'Add at least 5 skills (+10 points).',
  })
  checks.push({
    passed: data.projects.some(isProjectPopulated),
    points: 10,
    suggestion: 'Add at least one project (+10 points).',
  })
  checks.push({
    passed: Boolean(data.personal.phone.trim()),
    points: 5,
    suggestion: 'Add your phone number (+5 points).',
  })
  checks.push({
    passed: Boolean(data.links.linkedin.trim()),
    points: 5,
    suggestion: 'Add your LinkedIn URL (+5 points).',
  })
  checks.push({
    passed: Boolean(data.links.github.trim()),
    points: 5,
    suggestion: 'Add your GitHub URL (+5 points).',
  })
  checks.push({
    passed: actionVerbRegex.test(summary),
    points: 10,
    suggestion: 'Use action verbs in your summary (built, led, designed, improved) (+10 points).',
  })

  const score = Math.min(100, checks.reduce((acc, item) => acc + (item.passed ? item.points : 0), 0))
  const suggestions = checks.filter((item) => !item.passed).map((item) => item.suggestion)

  let statusLabel = 'Needs Work'
  let statusTone = 'bad'
  if (score > 40 && score <= 70) {
    statusLabel = 'Getting There'
    statusTone = 'mid'
  } else if (score > 70) {
    statusLabel = 'Strong Resume'
    statusTone = 'good'
  }

  return { score, suggestions, statusLabel, statusTone }
}

function clampScore(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return 0
  return Math.max(0, Math.min(100, num))
}

function calculateReadinessScore({ jobMatches, jdAnalyses, resumeAtsScore, applications, practiceCompletion }) {
  const jobMatchValues = (jobMatches || [])
    .map((item) => clampScore(item?.qualityScore ?? item?.matchQuality ?? item?.score))
  const jobMatchQuality = jobMatchValues.length
    ? jobMatchValues.reduce((acc, value) => acc + value, 0) / jobMatchValues.length
    : 0

  const jdValues = (jdAnalyses || [])
    .map((item) => clampScore(item?.skillAlignmentScore ?? item?.alignmentScore ?? item?.score))
  const jdSkillAlignment = jdValues.length
    ? jdValues.reduce((acc, value) => acc + value, 0) / jdValues.length
    : 0

  const totalApplications = (applications || []).length
  const completedApplications = (applications || []).filter((item) =>
    ['submitted', 'interview', 'offer', 'rejected', 'completed'].includes((item?.status || '').toLowerCase()),
  ).length
  const applicationProgress = totalApplications > 0 ? (completedApplications / totalApplications) * 100 : 0

  const components = {
    jobMatchQuality: clampScore(jobMatchQuality),
    jdSkillAlignment: clampScore(jdSkillAlignment),
    resumeAtsScore: clampScore(resumeAtsScore),
    applicationProgress: clampScore(applicationProgress),
    practiceCompletion: clampScore(practiceCompletion),
  }

  const score = Math.round(
    (components.jobMatchQuality * READINESS_WEIGHTS.jobMatchQuality +
      components.jdSkillAlignment * READINESS_WEIGHTS.jdSkillAlignment +
      components.resumeAtsScore * READINESS_WEIGHTS.resumeAtsScore +
      components.applicationProgress * READINESS_WEIGHTS.applicationProgress +
      components.practiceCompletion * READINESS_WEIGHTS.practiceCompletion) / 100,
  )

  return {
    score,
    weights: READINESS_WEIGHTS,
    components,
  }
}

function getExportWarnings(data) {
  const hasName = Boolean(data.personal.name.trim())
  const hasExperience = data.experience.some(isExperiencePopulated)
  const hasProject = data.projects.some(isProjectPopulated)
  const warnings = []

  if (!hasName) warnings.push('Name is missing.')
  if (!hasExperience && !hasProject) warnings.push('Add at least one project or experience entry.')
  return warnings
}

function buildResumePlainText(data) {
  const educationEntries = data.education.filter(isEducationPopulated)
  const experienceEntries = data.experience.filter(isExperiencePopulated)
  const projectEntries = data.projects.filter(isProjectPopulated)
  const contact = [data.personal.email.trim(), data.personal.phone.trim(), data.personal.location.trim()]
    .filter(Boolean)
    .join(' | ')

  const lines = []
  lines.push(data.personal.name.trim() || 'Name')
  lines.push(`Contact: ${contact || 'N/A'}`)
  lines.push('')
  lines.push('Summary')
  lines.push(data.summary.trim() || 'N/A')
  lines.push('')
  lines.push('Education')
  if (educationEntries.length > 0) {
    educationEntries.forEach((item) => {
      lines.push(`- ${item.degree.trim() || 'Degree'} ${item.school.trim() ? `- ${item.school.trim()}` : ''} ${(item.start.trim() || item.end.trim()) ? `(${item.start.trim()} - ${item.end.trim()})` : ''}`.trim())
    })
  } else {
    lines.push('N/A')
  }

  lines.push('')
  lines.push('Experience')
  if (experienceEntries.length > 0) {
    experienceEntries.forEach((item) => {
      lines.push(`- ${item.role.trim() || 'Role'} ${item.company.trim() ? `- ${item.company.trim()}` : ''} ${(item.start.trim() || item.end.trim()) ? `(${item.start.trim()} - ${item.end.trim()})` : ''}`.trim())
      extractBullets(item.details).forEach((bullet) => lines.push(`  * ${bullet}`))
    })
  } else {
    lines.push('N/A')
  }

  lines.push('')
  lines.push('Projects')
  if (projectEntries.length > 0) {
    projectEntries.forEach((item) => {
      lines.push(`- ${item.title.trim() || 'Project'}`)
      if (item.description.trim()) lines.push(`  * ${item.description.trim()}`)
      if (item.techStack.length > 0) lines.push(`  * Tech: ${item.techStack.join(', ')}`)
      if (item.liveUrl.trim()) lines.push(`  * Live: ${item.liveUrl.trim()}`)
      if (item.githubUrl.trim()) lines.push(`  * GitHub: ${item.githubUrl.trim()}`)
    })
  } else {
    lines.push('N/A')
  }

  lines.push('')
  lines.push('Skills')
  lines.push(`Technical Skills: ${data.skills.technical.join(', ') || 'N/A'}`)
  lines.push(`Soft Skills: ${data.skills.soft.join(', ') || 'N/A'}`)
  lines.push(`Tools & Technologies: ${data.skills.tools.join(', ') || 'N/A'}`)
  lines.push('')
  lines.push('Links')
  lines.push(`GitHub: ${data.links.github.trim() || 'N/A'}`)
  lines.push(`LinkedIn: ${data.links.linkedin.trim() || 'N/A'}`)

  return lines.join('\n')
}

function TopNav() {
  return (
    <header className="topbar app-nav">
      <div className="topbar__left">AI Resume Builder</div>
      <nav className="topbar__right nav-links">
        <Link to="/jobs" className="nav-link">Jobs</Link>
        <Link to="/analyze" className="nav-link">Analyze</Link>
        <Link to="/resume" className="nav-link">Resume</Link>
        <Link to="/applications" className="nav-link">Applications</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/settings" className="nav-link">Settings</Link>
        <Link to="/proof" className="nav-link">Proof</Link>
      </nav>
    </header>
  )
}

function TemplatePicker({ selectedTemplate, onTemplateSelect, accentColor, onColorSelect }) {
  const templates = [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
  ]

  return (
    <div className="template-picker-wrap">
      <div className="template-thumb-row" role="tablist" aria-label="Resume templates">
        {templates.map((template) => (
          <button
            type="button"
            key={template.id}
            className={`template-thumb ${selectedTemplate === template.id ? 'active' : ''}`}
            onClick={() => onTemplateSelect(template.id)}
            aria-label={template.label}
          >
            <div className={`template-sketch template-sketch-${template.id}`}>
              <span />
              <span />
              <span />
            </div>
            <div className="template-thumb-label">{template.label}</div>
            {selectedTemplate === template.id ? <div className="template-check">✓</div> : null}
          </button>
        ))}
      </div>

      <div className="color-picker-row">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            className={`color-dot ${accentColor === color.value ? 'active' : ''}`}
            style={{ backgroundColor: color.value }}
            aria-label={color.name}
            onClick={() => onColorSelect(color.value)}
          />
        ))}
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <div className="page-wrapper">
      <TopNav />
      <main className="home-main">
        <h1 className="home-headline">Build a Resume That Gets Read.</h1>
        <Link className="btn btn-primary btn-lg" to="/resume">Start Building</Link>
      </main>
    </div>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div className="page-wrapper">
      <TopNav />
      <main className="proof-main-container">
        <section className="card proof-card">
          <h1 className="card-header">{title}</h1>
          <p className="card-body">Page scaffold ready.</p>
        </section>
      </main>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="input" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

function ListSection({ title, items, onAdd, renderItem }) {
  return (
    <section className="card form-card">
      <div className="card-header row-between">
        <span>{title}</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onAdd}>Add</button>
      </div>
      <div className="card-body list-stack">
        {items.map((item, index) => (
          <div key={index} className="list-item">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </section>
  )
}

function AccordionCard({ title, children, isOpen, onToggle, rightAction = null }) {
  return (
    <section className="card form-card">
      <div className="card-header row-between accordion-head">
        <button type="button" className="accordion-toggle" onClick={onToggle}>
          <span>{title}</span>
          <span>{isOpen ? '−' : '+'}</span>
        </button>
        {rightAction}
      </div>
      {isOpen ? <div className="card-body">{children}</div> : null}
    </section>
  )
}

function SkillCategory({ label, skills, inputValue, onInputChange, onInputEnter, onRemove }) {
  return (
    <div className="skill-group">
      <label className="form-label">{label} ({skills.length})</label>
      <div className="chip-row">
        {skills.map((skill) => (
          <span key={skill} className="chip">
            {skill}
            <button type="button" className="chip-remove" onClick={() => onRemove(skill)} aria-label={`Remove ${skill}`}>
              X
            </button>
          </span>
        ))}
      </div>
      <input
        className="input"
        value={inputValue}
        placeholder="Type a skill and press Enter"
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onInputEnter()
          }
        }}
      />
    </div>
  )
}

function BulletGuidance({ text }) {
  const checks = evaluateBullets(text)
  const issues = checks.filter((item) => !item.hasVerb || !item.hasNumber)

  if (issues.length === 0) return null

  return (
    <div className="bullet-guidance" aria-live="polite">
      {issues.map((item) => (
        <p key={`${item.index}-${item.text}`} className="bullet-hint">
          Bullet {item.index + 1}:
          {!item.hasVerb ? ' Start with a strong action verb.' : ''}
          {!item.hasNumber ? ' Add measurable impact (numbers).' : ''}
        </p>
      ))}
    </div>
  )
}

function ResumeShell({ data, template = 'classic', monochrome = false, accentColor }) {
  const educationEntries = data.education.filter(isEducationPopulated)
  const experienceEntries = data.experience.filter(isExperiencePopulated)
  const projectEntries = data.projects.filter(isProjectPopulated)
  const showLinks = data.links.github.trim() || data.links.linkedin.trim()
  const hasAnySkills = getAllSkills(data).length > 0

  const contactLine = [data.personal.email.trim(), data.personal.phone.trim(), data.personal.location.trim()]
    .filter(Boolean)
    .join(' | ')

  const containerClass = `resume-shell template-${template} ${monochrome ? 'monochrome' : ''}`.trim()

  const sharedSections = (
    <>
      {data.summary.trim() ? (
        <div className="resume-block">
          <h3>Summary</h3>
          <p>{data.summary.trim()}</p>
        </div>
      ) : null}

      {educationEntries.length > 0 ? (
        <div className="resume-block">
          <h3>Education</h3>
          {educationEntries.map((item, idx) => (
            <p key={idx}>
              {item.degree.trim()} {item.school.trim() ? `- ${item.school.trim()}` : ''}
              {(item.start.trim() || item.end.trim()) ? ` (${item.start.trim()} - ${item.end.trim()})` : ''}
            </p>
          ))}
        </div>
      ) : null}

      {experienceEntries.length > 0 ? (
        <div className="resume-block">
          <h3>Experience</h3>
          {experienceEntries.map((item, idx) => (
            <div key={idx} className="resume-subblock">
              <p>
                {item.role.trim()} {item.company.trim() ? `- ${item.company.trim()}` : ''}
                {(item.start.trim() || item.end.trim()) ? ` (${item.start.trim()} - ${item.end.trim()})` : ''}
              </p>
              {extractBullets(item.details).map((bullet, bulletIndex) => (
                <p key={bulletIndex} className="resume-bullet">- {bullet}</p>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {projectEntries.length > 0 ? (
        <div className="resume-block">
          <h3>Projects</h3>
          <div className="project-preview-grid">
            {projectEntries.map((item, idx) => (
              <div key={idx} className="project-preview-card">
                <p className="project-preview-title">{item.title.trim() || 'Project'}</p>
                {item.description.trim() ? <p>{item.description.trim()}</p> : null}
                {item.techStack.length > 0 ? (
                  <div className="chip-row preview-chip-row">
                    {item.techStack.map((tech) => <span key={tech} className="chip chip-static">{tech}</span>)}
                  </div>
                ) : null}
                <div className="project-links">
                  {item.liveUrl.trim() ? <a href={item.liveUrl.trim()} target="_blank" rel="noreferrer" className="link-icon">🔗 Live</a> : null}
                  {item.githubUrl.trim() ? <a href={item.githubUrl.trim()} target="_blank" rel="noreferrer" className="link-icon">⌘ GitHub</a> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )

  return (
    <section className={containerClass} style={{ '--resume-accent': accentColor }}>
      {template === 'modern' ? (
        <div className="resume-modern-layout">
          <aside className="resume-modern-sidebar">
            <h2 className="resume-name">{data.personal.name.trim() || 'Your Name'}</h2>
            {contactLine ? <p className="resume-meta">{contactLine}</p> : null}

            {hasAnySkills ? (
              <div className="resume-block">
                <h3>Skills</h3>
                {data.skills.technical.length > 0 ? (
                  <div className="skill-preview-group">
                    <p className="skill-group-label">Technical Skills</p>
                    <div className="chip-row preview-chip-row">
                      {data.skills.technical.map((skill) => <span key={skill} className="chip chip-static">{skill}</span>)}
                    </div>
                  </div>
                ) : null}
                {data.skills.soft.length > 0 ? (
                  <div className="skill-preview-group">
                    <p className="skill-group-label">Soft Skills</p>
                    <div className="chip-row preview-chip-row">
                      {data.skills.soft.map((skill) => <span key={skill} className="chip chip-static">{skill}</span>)}
                    </div>
                  </div>
                ) : null}
                {data.skills.tools.length > 0 ? (
                  <div className="skill-preview-group">
                    <p className="skill-group-label">Tools & Technologies</p>
                    <div className="chip-row preview-chip-row">
                      {data.skills.tools.map((skill) => <span key={skill} className="chip chip-static">{skill}</span>)}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {showLinks ? (
              <div className="resume-block">
                <h3>Links</h3>
                {data.links.github.trim() ? <p>GitHub: {data.links.github.trim()}</p> : null}
                {data.links.linkedin.trim() ? <p>LinkedIn: {data.links.linkedin.trim()}</p> : null}
              </div>
            ) : null}
          </aside>

          <div className="resume-modern-main">
            {sharedSections}
          </div>
        </div>
      ) : (
        <>
          <h2 className="resume-name">{data.personal.name.trim() || 'Your Name'}</h2>
          {contactLine ? <p className="resume-meta">{contactLine}</p> : null}
          {sharedSections}

          {hasAnySkills ? (
            <div className="resume-block">
              <h3>Skills</h3>
              {data.skills.technical.length > 0 ? (
                <div className="skill-preview-group">
                  <p className="skill-group-label">Technical Skills</p>
                  <div className="chip-row preview-chip-row">
                    {data.skills.technical.map((skill) => <span key={skill} className="chip chip-static">{skill}</span>)}
                  </div>
                </div>
              ) : null}
              {data.skills.soft.length > 0 ? (
                <div className="skill-preview-group">
                  <p className="skill-group-label">Soft Skills</p>
                  <div className="chip-row preview-chip-row">
                    {data.skills.soft.map((skill) => <span key={skill} className="chip chip-static">{skill}</span>)}
                  </div>
                </div>
              ) : null}
              {data.skills.tools.length > 0 ? (
                <div className="skill-preview-group">
                  <p className="skill-group-label">Tools & Technologies</p>
                  <div className="chip-row preview-chip-row">
                    {data.skills.tools.map((skill) => <span key={skill} className="chip chip-static">{skill}</span>)}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {showLinks ? (
            <div className="resume-block">
              <h3>Links</h3>
              {data.links.github.trim() ? <p>GitHub: {data.links.github.trim()}</p> : null}
              {data.links.linkedin.trim() ? <p>LinkedIn: {data.links.linkedin.trim()}</p> : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}

function ScoreCard({ scoreData }) {
  return (
    <section className="card score-card">
      <div className="card-header">ATS Readiness Score</div>
      <div className="card-body">
        <div className="score-row">
          <span className="score-value">{scoreData.score}</span>
          <span className="score-max">/100</span>
        </div>
        <div className="score-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={scoreData.score}>
          <div className="score-fill" style={{ width: `${scoreData.score}%` }} />
        </div>

        {scoreData.suggestions.length > 0 ? (
          <ul className="suggestion-list">
            {scoreData.suggestions.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ul>
        ) : (
          <p className="suggestion-clear">All core ATS checks are complete.</p>
        )}
      </div>
    </section>
  )
}

function PreviewAtsCard({ scoreData }) {
  return (
    <section className="card preview-ats-card">
      <div className="ats-circle-wrap">
        <div
          className={`ats-circle ats-${scoreData.statusTone}`}
          style={{ '--progress': `${scoreData.score}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={scoreData.score}
        >
          <div className="ats-circle-inner">{scoreData.score}</div>
        </div>
        <p className={`ats-status ats-${scoreData.statusTone}`}>{scoreData.statusLabel}</p>
      </div>

      <div className="improvement-block">
        <h4>Improvement Suggestions</h4>
        {scoreData.suggestions.length > 0 ? (
          <ul className="suggestion-list">
            {scoreData.suggestions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="suggestion-clear">No missing ATS items detected.</p>
        )}
      </div>
    </section>
  )
}

function BuilderPage({
  data,
  setData,
  scoreData,
  selectedTemplate,
  setSelectedTemplate,
  accentColor,
  setAccentColor,
}) {
  const [skillsOpen, setSkillsOpen] = useState(true)
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [suggestingSkills, setSuggestingSkills] = useState(false)
  const [skillInput, setSkillInput] = useState({ technical: '', soft: '', tools: '' })
  const [projectTechInput, setProjectTechInput] = useState({})
  const [openProjects, setOpenProjects] = useState(() => new Set([0]))

  const updatePersonal = (key, value) => {
    setData((prev) => ({ ...prev, personal: { ...prev.personal, [key]: value } }))
  }

  const updateLinks = (key, value) => {
    setData((prev) => ({ ...prev, links: { ...prev.links, [key]: value } }))
  }

  const addEntry = (section, entry) => {
    setData((prev) => ({ ...prev, [section]: [...prev[section], entry] }))
  }

  const updateListField = (section, index, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, idx) => (idx === index ? { ...item, [key]: value } : item)),
    }))
  }

  const addSkill = (category) => {
    const value = skillInput[category].trim()
    if (!value) return
    setData((prev) => {
      if (prev.skills[category].some((skill) => skill.toLowerCase() === value.toLowerCase())) return prev
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [category]: [...prev.skills[category], value],
        },
      }
    })
    setSkillInput((prev) => ({ ...prev, [category]: '' }))
  }

  const removeSkill = (category, value) => {
    setData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((skill) => skill !== value),
      },
    }))
  }

  const suggestSkills = () => {
    setSuggestingSkills(true)
    setTimeout(() => {
      const suggested = {
        technical: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
        soft: ['Team Leadership', 'Problem Solving'],
        tools: ['Git', 'Docker', 'AWS'],
      }
      setData((prev) => ({
        ...prev,
        skills: {
          technical: [...new Set([...prev.skills.technical, ...suggested.technical])],
          soft: [...new Set([...prev.skills.soft, ...suggested.soft])],
          tools: [...new Set([...prev.skills.tools, ...suggested.tools])],
        },
      }))
      setSuggestingSkills(false)
    }, 1000)
  }

  const addProject = () => {
    const nextIndex = data.projects.length
    addEntry('projects', { title: '', description: '', techStack: [], liveUrl: '', githubUrl: '' })
    setOpenProjects((prev) => new Set([...prev, nextIndex]))
  }

  const deleteProject = (index) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index),
    }))
    setOpenProjects((prev) => {
      const next = new Set()
      prev.forEach((value) => {
        if (value < index) next.add(value)
        if (value > index) next.add(value - 1)
      })
      return next
    })
  }

  const toggleProject = (index) => {
    setOpenProjects((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const addProjectTech = (index) => {
    const value = (projectTechInput[index] || '').trim()
    if (!value) return
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((item, idx) => {
        if (idx !== index) return item
        if (item.techStack.some((tech) => tech.toLowerCase() === value.toLowerCase())) return item
        return { ...item, techStack: [...item.techStack, value] }
      }),
    }))
    setProjectTechInput((prev) => ({ ...prev, [index]: '' }))
  }

  const removeProjectTech = (index, tech) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((item, idx) =>
        idx === index ? { ...item, techStack: item.techStack.filter((entry) => entry !== tech) } : item,
      ),
    }))
  }

  return (
    <div className="page-wrapper">
      <TopNav />
      <section className="context-header">
        <h1 className="context-header__title">Resume Builder</h1>
        <p className="context-header__subtitle">Live autosave enabled. ATS scoring v1 updates while you edit.</p>
      </section>
      <main className="builder-grid">
        <section className="builder-left">
          <div className="row-between">
            <h2 className="section-title">Form Sections</h2>
            <button type="button" className="btn btn-secondary" onClick={() => setData(sampleResume)}>
              Load Sample Data
            </button>
          </div>

          <section className="card form-card">
            <div className="card-header">Personal Info</div>
            <div className="card-body grid-two">
              <Field label="Name" value={data.personal.name} onChange={(e) => updatePersonal('name', e.target.value)} />
              <Field label="Email" value={data.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} />
              <Field label="Phone" value={data.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
              <Field label="Location" value={data.personal.location} onChange={(e) => updatePersonal('location', e.target.value)} />
            </div>
          </section>

          <section className="card form-card">
            <div className="card-header">Summary</div>
            <div className="card-body">
              <textarea
                className="textarea"
                value={data.summary}
                onChange={(e) => setData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Write a brief professional summary."
              />
            </div>
          </section>

          <ListSection
            title="Education"
            items={data.education}
            onAdd={() => addEntry('education', { school: '', degree: '', start: '', end: '' })}
            renderItem={(item, index) => (
              <div className="grid-two">
                <Field label="School" value={item.school} onChange={(e) => updateListField('education', index, 'school', e.target.value)} />
                <Field label="Degree" value={item.degree} onChange={(e) => updateListField('education', index, 'degree', e.target.value)} />
                <Field label="Start" value={item.start} onChange={(e) => updateListField('education', index, 'start', e.target.value)} />
                <Field label="End" value={item.end} onChange={(e) => updateListField('education', index, 'end', e.target.value)} />
              </div>
            )}
          />

          <ListSection
            title="Experience"
            items={data.experience}
            onAdd={() => addEntry('experience', { company: '', role: '', start: '', end: '', details: '' })}
            renderItem={(item, index) => (
              <>
                <div className="grid-two">
                  <Field label="Company" value={item.company} onChange={(e) => updateListField('experience', index, 'company', e.target.value)} />
                  <Field label="Role" value={item.role} onChange={(e) => updateListField('experience', index, 'role', e.target.value)} />
                  <Field label="Start" value={item.start} onChange={(e) => updateListField('experience', index, 'start', e.target.value)} />
                  <Field label="End" value={item.end} onChange={(e) => updateListField('experience', index, 'end', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Details (one bullet per line)</label>
                  <textarea className="textarea" value={item.details} onChange={(e) => updateListField('experience', index, 'details', e.target.value)} />
                  <BulletGuidance text={item.details} />
                </div>
              </>
            )}
          />

          <AccordionCard
            title="Skills"
            isOpen={skillsOpen}
            onToggle={() => setSkillsOpen((prev) => !prev)}
            rightAction={
              <button type="button" className="btn btn-secondary btn-sm" onClick={suggestSkills} disabled={suggestingSkills}>
                {suggestingSkills ? 'Suggesting...' : '✨ Suggest Skills'}
              </button>
            }
          >
            <div className="list-stack">
              <SkillCategory
                label="Technical Skills"
                skills={data.skills.technical}
                inputValue={skillInput.technical}
                onInputChange={(value) => setSkillInput((prev) => ({ ...prev, technical: value }))}
                onInputEnter={() => addSkill('technical')}
                onRemove={(value) => removeSkill('technical', value)}
              />
              <SkillCategory
                label="Soft Skills"
                skills={data.skills.soft}
                inputValue={skillInput.soft}
                onInputChange={(value) => setSkillInput((prev) => ({ ...prev, soft: value }))}
                onInputEnter={() => addSkill('soft')}
                onRemove={(value) => removeSkill('soft', value)}
              />
              <SkillCategory
                label="Tools & Technologies"
                skills={data.skills.tools}
                inputValue={skillInput.tools}
                onInputChange={(value) => setSkillInput((prev) => ({ ...prev, tools: value }))}
                onInputEnter={() => addSkill('tools')}
                onRemove={(value) => removeSkill('tools', value)}
              />
            </div>
          </AccordionCard>

          <AccordionCard
            title="Projects"
            isOpen={projectsOpen}
            onToggle={() => setProjectsOpen((prev) => !prev)}
            rightAction={
              <button type="button" className="btn btn-secondary btn-sm" onClick={addProject}>Add Project</button>
            }
          >
            <div className="project-list">
              {data.projects.map((project, index) => {
                const open = openProjects.has(index)
                const headerLabel = project.title.trim() || `Untitled Project ${index + 1}`
                return (
                  <article key={index} className="project-editor-card">
                    <div className="project-editor-head">
                      <button type="button" className="project-title-toggle" onClick={() => toggleProject(index)}>
                        {headerLabel}
                      </button>
                      <div className="project-head-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleProject(index)}>
                          {open ? 'Collapse' : 'Expand'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteProject(index)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {open ? (
                      <div className="project-editor-body">
                        <Field
                          label="Project Title"
                          value={project.title}
                          onChange={(e) => updateListField('projects', index, 'title', e.target.value)}
                        />
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea
                            className="textarea"
                            maxLength={200}
                            value={project.description}
                            onChange={(e) => updateListField('projects', index, 'description', e.target.value)}
                          />
                          <p className="char-counter">{project.description.length}/200</p>
                          <BulletGuidance text={project.description} />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Tech Stack</label>
                          <div className="chip-row">
                            {project.techStack.map((tech) => (
                              <span key={tech} className="chip">
                                {tech}
                                <button
                                  type="button"
                                  className="chip-remove"
                                  onClick={() => removeProjectTech(index, tech)}
                                  aria-label={`Remove ${tech}`}
                                >
                                  X
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            className="input"
                            value={projectTechInput[index] || ''}
                            placeholder="Type tech and press Enter"
                            onChange={(e) => setProjectTechInput((prev) => ({ ...prev, [index]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addProjectTech(index)
                              }
                            }}
                          />
                        </div>

                        <Field
                          label="Live URL (optional)"
                          value={project.liveUrl}
                          onChange={(e) => updateListField('projects', index, 'liveUrl', e.target.value)}
                        />
                        <Field
                          label="GitHub URL (optional)"
                          value={project.githubUrl}
                          onChange={(e) => updateListField('projects', index, 'githubUrl', e.target.value)}
                        />
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </AccordionCard>

          <section className="card form-card">
            <div className="card-header">Links</div>
            <div className="card-body grid-two">
              <Field label="GitHub" value={data.links.github} onChange={(e) => updateLinks('github', e.target.value)} />
              <Field label="LinkedIn" value={data.links.linkedin} onChange={(e) => updateLinks('linkedin', e.target.value)} />
            </div>
          </section>
        </section>

        <aside className="builder-right">
          <section className="card template-card">
            <div className="card-header">Template</div>
            <div className="card-body">
              <TemplatePicker
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
                accentColor={accentColor}
                onColorSelect={setAccentColor}
              />
            </div>
          </section>
          <ScoreCard scoreData={scoreData} />
          <div className="card preview-card">
            <div className="card-header">Live Preview</div>
            <div className="card-body">
              <ResumeShell data={data} template={selectedTemplate} accentColor={accentColor} />
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

function PreviewPage({ data, scoreData, selectedTemplate, setSelectedTemplate, accentColor, setAccentColor }) {
  const [copyStatus, setCopyStatus] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const exportWarnings = useMemo(() => getExportWarnings(data), [data])

  const handleDownloadPdf = () => {
    if (exportWarnings.length > 0) setShowWarning(true)
    setToastMessage('PDF export ready! Check your downloads.')
    window.setTimeout(() => setToastMessage(''), 2200)
    window.print()
  }

  const copyWithFallback = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const success = document.execCommand('copy')
    document.body.removeChild(area)
    return success
  }

  const handleCopyText = async () => {
    if (exportWarnings.length > 0) setShowWarning(true)
    try {
      const success = await copyWithFallback(buildResumePlainText(data))
      setCopyStatus(success ? 'Resume text copied.' : 'Could not copy resume text.')
    } catch {
      setCopyStatus('Could not copy resume text.')
    }
  }

  return (
    <div className="page-wrapper preview-page">
      <TopNav />
      <main className="preview-main">
        <section className="card template-card preview-template-card">
          <div className="card-header">Template & Color</div>
          <div className="card-body">
            <TemplatePicker
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              accentColor={accentColor}
              onColorSelect={setAccentColor}
            />
          </div>
        </section>
        <section className="card preview-toolbar">
          <button type="button" className="btn btn-primary" onClick={handleDownloadPdf}>Download PDF</button>
          <button type="button" className="btn btn-secondary" onClick={handleCopyText}>Copy Resume as Text</button>
        </section>

        <PreviewAtsCard scoreData={scoreData} />

        {showWarning && exportWarnings.length > 0 ? (
          <section className="card export-warning">
            <p>Your resume may look incomplete.</p>
          </section>
        ) : null}

        {copyStatus ? (
          <p className="copy-status">{copyStatus}</p>
        ) : null}

        {toastMessage ? <p className="copy-status">{toastMessage}</p> : null}

        <div className="print-target">
          <ResumeShell data={data} template={selectedTemplate} monochrome accentColor={accentColor} />
        </div>
      </main>
    </div>
  )
}

function ProofPage() {
  return (
    <div className="page-wrapper">
      <TopNav />
      <main className="proof-main-container">
        <section className="card proof-card">
          <h1 className="card-header">Proof</h1>
          <p className="card-body">Placeholder for artifacts.</p>
        </section>
      </main>
    </div>
  )
}

export default function App() {
  const initialAppState = useMemo(() => {
    try {
      const raw = localStorage.getItem(APP_STATE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  const [resumeData, setResumeData] = useState(() => {
    try {
      if (initialAppState && typeof initialAppState === 'object' && initialAppState.resumeData) {
        return normalizeResume(initialAppState.resumeData)
      }
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return emptyResume
      return normalizeResume(JSON.parse(stored))
    } catch {
      return emptyResume
    }
  })

  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    try {
      if (initialAppState && typeof initialAppState === 'object' && initialAppState.preferences?.template) {
        return normalizeTemplate(initialAppState.preferences.template)
      }
      return normalizeTemplate(localStorage.getItem(TEMPLATE_KEY) || 'classic')
    } catch {
      return 'classic'
    }
  })

  const [selectedAccentColor, setSelectedAccentColor] = useState(() => {
    try {
      if (initialAppState && typeof initialAppState === 'object' && initialAppState.preferences?.accentColor) {
        return normalizeAccentColor(initialAppState.preferences.accentColor)
      }
      return normalizeAccentColor(localStorage.getItem(ACCENT_KEY))
    } catch {
      return ACCENT_COLORS[0].value
    }
  })

  const [jobMatches] = useState(() =>
    Array.isArray(initialAppState?.jobMatches) ? initialAppState.jobMatches : [],
  )
  const [applications] = useState(() =>
    Array.isArray(initialAppState?.applications) ? initialAppState.applications : [],
  )
  const [jdAnalyses] = useState(() =>
    Array.isArray(initialAppState?.jdAnalyses) ? initialAppState.jdAnalyses : [],
  )
  const [practiceCompletion] = useState(() =>
    clampScore(initialAppState?.practiceCompletion ?? 0),
  )

  const scoreData = useMemo(() => calculateResumeScore(resumeData), [resumeData])
  const readinessData = useMemo(
    () =>
      calculateReadinessScore({
        jobMatches,
        jdAnalyses,
        resumeAtsScore: scoreData.score,
        applications,
        practiceCompletion,
      }),
    [jobMatches, jdAnalyses, scoreData.score, applications, practiceCompletion],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData))
  }, [resumeData])

  useEffect(() => {
    localStorage.setItem(TEMPLATE_KEY, selectedTemplate)
  }, [selectedTemplate])

  useEffect(() => {
    localStorage.setItem(ACCENT_KEY, selectedAccentColor)
  }, [selectedAccentColor])

  useEffect(() => {
    const appState = {
      preferences: {
        template: selectedTemplate,
        accentColor: selectedAccentColor,
      },
      resumeData,
      jobMatches,
      applications,
      jdAnalyses,
      readinessScore: readinessData,
      practiceCompletion,
      lastActivity: new Date().toISOString(),
    }
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(appState))
  }, [
    resumeData,
    selectedTemplate,
    selectedAccentColor,
    jobMatches,
    applications,
    jdAnalyses,
    readinessData,
    practiceCompletion,
  ])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<PlaceholderPage title="Jobs" />} />
      <Route path="/applications" element={<PlaceholderPage title="Applications" />} />
      <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
      <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      <Route
        path="/resume"
        element={
          <BuilderPage
            data={resumeData}
            setData={setResumeData}
            scoreData={scoreData}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            accentColor={selectedAccentColor}
            setAccentColor={setSelectedAccentColor}
          />
        }
      />
      <Route
        path="/analyze"
        element={
          <PreviewPage
            data={resumeData}
            scoreData={scoreData}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            accentColor={selectedAccentColor}
            setAccentColor={setSelectedAccentColor}
          />
        }
      />
      <Route path="/proof" element={<ProofPage />} />
      <Route path="/builder" element={<Navigate to="/resume" replace />} />
      <Route path="/preview" element={<Navigate to="/analyze" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
