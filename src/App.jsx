import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'resumeBuilderData'
const TEMPLATE_KEY = 'resumeBuilderTemplate'
const ACCENT_KEY = 'resumeBuilderAccentColor'
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

function calculateAtsV1(data) {
  const summaryWords = data.summary.trim().split(/\s+/).filter(Boolean).length
  const hasStrongSummary = summaryWords >= 40 && summaryWords <= 120

  const projectEntries = data.projects.filter(isProjectPopulated)
  const experienceEntries = data.experience.filter(isExperiencePopulated)
  const skillItems = getAllSkills(data)

  const hasLink = Boolean(data.links.github.trim() || data.links.linkedin.trim())
  const completeEducation =
    data.education.filter(isEducationPopulated).length > 0 &&
    data.education.filter(isEducationPopulated).every(
      (item) => item.school.trim() && item.degree.trim() && item.start.trim() && item.end.trim(),
    )

  const quantifiedText = [
    ...experienceEntries.map((item) => item.details),
    ...projectEntries.map((item) => item.description),
  ]
  const hasQuantifiedImpact = quantifiedText.some((text) => hasNumber(text || ''))

  const rawScore =
    (hasStrongSummary ? 15 : 0) +
    (projectEntries.length >= 2 ? 10 : 0) +
    (experienceEntries.length >= 1 ? 10 : 0) +
    (skillItems.length >= 8 ? 10 : 0) +
    (hasLink ? 10 : 0) +
    (hasQuantifiedImpact ? 15 : 0) +
    (completeEducation ? 10 : 0)

  const score = Math.min(100, rawScore)
  const suggestions = []

  if (!hasStrongSummary) suggestions.push('Write a stronger summary (40-120 words).')
  if (projectEntries.length < 2) suggestions.push('Add at least 2 projects.')
  if (!hasQuantifiedImpact) suggestions.push('Add measurable impact (numbers) in bullets.')
  if (skillItems.length < 8) suggestions.push('Add more skills (target 8+).')
  if (!hasLink) suggestions.push('Add a GitHub or LinkedIn link.')
  if (experienceEntries.length < 1) suggestions.push('Add at least 1 experience entry.')
  if (!completeEducation) suggestions.push('Complete all education fields (school, degree, start, end).')

  return {
    score,
    suggestions: suggestions.slice(0, 3),
  }
}

function topImprovements(data) {
  const summaryWords = data.summary.trim().split(/\s+/).filter(Boolean).length
  const projectEntries = data.projects.filter(isProjectPopulated)
  const experienceEntries = data.experience.filter(isExperiencePopulated)
  const skillItems = getAllSkills(data)
  const hasQuantifiedImpact =
    [...experienceEntries.map((item) => item.details), ...projectEntries.map((item) => item.description)]
      .some((text) => hasNumber(text || ''))

  const items = []
  if (projectEntries.length < 2) items.push('Add at least 2 projects to strengthen technical depth.')
  if (!hasQuantifiedImpact) items.push('Add measurable impact (numbers) in experience or project bullets.')
  if (summaryWords < 40) items.push('Expand your summary to at least 40 words.')
  if (skillItems.length < 8) items.push('Expand your skills list to 8+ relevant skills.')
  if (experienceEntries.length < 1) items.push('Add experience, internship, or project work with outcomes.')

  return items.slice(0, 3)
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
        <Link to="/builder" className="nav-link">Builder</Link>
        <Link to="/preview" className="nav-link">Preview</Link>
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
        <Link className="btn btn-primary btn-lg" to="/builder">Start Building</Link>
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

function ScoreCard({ score, suggestions, improvements }) {
  return (
    <section className="card score-card">
      <div className="card-header">ATS Readiness Score</div>
      <div className="card-body">
        <div className="score-row">
          <span className="score-value">{score}</span>
          <span className="score-max">/100</span>
        </div>
        <div className="score-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}>
          <div className="score-fill" style={{ width: `${score}%` }} />
        </div>

        {suggestions.length > 0 ? (
          <ul className="suggestion-list">
            {suggestions.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ul>
        ) : (
          <p className="suggestion-clear">Core ATS checks passed for v1.</p>
        )}

        <div className="improvement-block">
          <h4>Top 3 Improvements</h4>
          {improvements.length > 0 ? (
            <ul className="suggestion-list">
              {improvements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="suggestion-clear">No immediate improvements required for this ruleset.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function BuilderPage({
  data,
  setData,
  scoreData,
  improvements,
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
          <ScoreCard score={scoreData.score} suggestions={scoreData.suggestions} improvements={improvements} />
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

function PreviewPage({ data, selectedTemplate, setSelectedTemplate, accentColor, setAccentColor }) {
  const [copyStatus, setCopyStatus] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const exportWarnings = useMemo(() => getExportWarnings(data), [data])

  const handleDownloadPdf = () => {
    if (exportWarnings.length > 0) setShowWarning(true)
    setToastMessage('PDF export ready! Check your downloads.')
    window.setTimeout(() => setToastMessage(''), 2200)
  }

  const handleCopyText = async () => {
    if (exportWarnings.length > 0) setShowWarning(true)
    try {
      await navigator.clipboard.writeText(buildResumePlainText(data))
      setCopyStatus('Resume text copied.')
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
  const [resumeData, setResumeData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return emptyResume
      return normalizeResume(JSON.parse(stored))
    } catch {
      return emptyResume
    }
  })

  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    try {
      return normalizeTemplate(localStorage.getItem(TEMPLATE_KEY) || 'classic')
    } catch {
      return 'classic'
    }
  })

  const [selectedAccentColor, setSelectedAccentColor] = useState(() => {
    try {
      return normalizeAccentColor(localStorage.getItem(ACCENT_KEY))
    } catch {
      return ACCENT_COLORS[0].value
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData))
  }, [resumeData])

  useEffect(() => {
    localStorage.setItem(TEMPLATE_KEY, selectedTemplate)
  }, [selectedTemplate])

  useEffect(() => {
    localStorage.setItem(ACCENT_KEY, selectedAccentColor)
  }, [selectedAccentColor])

  const scoreData = useMemo(() => calculateAtsV1(resumeData), [resumeData])
  const improvements = useMemo(() => topImprovements(resumeData), [resumeData])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/builder"
        element={
          <BuilderPage
            data={resumeData}
            setData={setResumeData}
            scoreData={scoreData}
            improvements={improvements}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            accentColor={selectedAccentColor}
            setAccentColor={setSelectedAccentColor}
          />
        }
      />
      <Route
        path="/preview"
        element={
          <PreviewPage
            data={resumeData}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            accentColor={selectedAccentColor}
            setAccentColor={setSelectedAccentColor}
          />
        }
      />
      <Route path="/proof" element={<ProofPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
