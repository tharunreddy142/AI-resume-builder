import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'resumeBuilderData'
const TEMPLATE_KEY = 'resumeBuilderTemplate'
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
  projects: [{ name: '', tech: '', description: '' }],
  skills: '',
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
      name: 'TaskFlow',
      tech: 'React, Node.js',
      description: 'Built collaborative tracker used by 2k+ users with weekly reports.',
    },
    {
      name: 'Resume Lens',
      tech: 'TypeScript, PostgreSQL',
      description: 'Optimized keyword insights and improved relevance score by 18%.',
    },
  ],
  skills: 'React, JavaScript, TypeScript, Node.js, SQL, REST APIs, Git, Testing',
  links: {
    github: 'github.com/aaravsharma',
    linkedin: 'linkedin.com/in/aaravsharma',
  },
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
        ? raw.projects.map((item) => ({
            name: item?.name || '',
            tech: item?.tech || '',
            description: item?.description || '',
          }))
        : [{ name: '', tech: '', description: '' }],
    skills: raw.skills || '',
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

function isEducationPopulated(item) {
  return Boolean(item.school.trim() || item.degree.trim() || item.start.trim() || item.end.trim())
}

function isExperiencePopulated(item) {
  return Boolean(
    item.company.trim() || item.role.trim() || item.start.trim() || item.end.trim() || item.details.trim(),
  )
}

function isProjectPopulated(item) {
  return Boolean(item.name.trim() || item.tech.trim() || item.description.trim())
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
  const skillItems = data.skills
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

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
  const skillItems = data.skills
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
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
  const skills = data.skills
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
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
      lines.push(`- ${item.name.trim() || 'Project'}${item.tech.trim() ? ` | ${item.tech.trim()}` : ''}`)
      extractBullets(item.description).forEach((bullet) => lines.push(`  * ${bullet}`))
    })
  } else {
    lines.push('N/A')
  }
  lines.push('')
  lines.push('Skills')
  lines.push(skills.length > 0 ? skills.join(', ') : 'N/A')
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

function TemplateTabs({ selectedTemplate, onSelect }) {
  return (
    <div className="template-tabs" role="tablist" aria-label="Resume templates">
      <button type="button" className={`template-tab ${selectedTemplate === 'classic' ? 'active' : ''}`} onClick={() => onSelect('classic')}>Classic</button>
      <button type="button" className={`template-tab ${selectedTemplate === 'modern' ? 'active' : ''}`} onClick={() => onSelect('modern')}>Modern</button>
      <button type="button" className={`template-tab ${selectedTemplate === 'minimal' ? 'active' : ''}`} onClick={() => onSelect('minimal')}>Minimal</button>
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

function ResumeShell({ data, template = 'classic', monochrome = false }) {
  const educationEntries = data.education.filter(isEducationPopulated)
  const experienceEntries = data.experience.filter(isExperiencePopulated)
  const projectEntries = data.projects.filter(isProjectPopulated)
  const skillItems = data.skills
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const showLinks = data.links.github.trim() || data.links.linkedin.trim()

  const contactLine = [data.personal.email.trim(), data.personal.phone.trim(), data.personal.location.trim()]
    .filter(Boolean)
    .join(' | ')

  const containerClass = `resume-shell template-${template} ${monochrome ? 'monochrome' : ''}`.trim()

  return (
    <section className={containerClass}>
      <h2 className="resume-name">{data.personal.name.trim() || 'Your Name'}</h2>
      {contactLine ? <p className="resume-meta">{contactLine}</p> : null}

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
          {projectEntries.map((item, idx) => (
            <div key={idx} className="resume-subblock">
              <p>
                {item.name.trim()}
                {item.tech.trim() ? ` | ${item.tech.trim()}` : ''}
              </p>
              {extractBullets(item.description).map((bullet, bulletIndex) => (
                <p key={bulletIndex} className="resume-bullet">- {bullet}</p>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {skillItems.length > 0 ? (
        <div className="resume-block">
          <h3>Skills</h3>
          <p>{skillItems.join(', ')}</p>
        </div>
      ) : null}

      {showLinks ? (
        <div className="resume-block">
          <h3>Links</h3>
          {data.links.github.trim() ? <p>GitHub: {data.links.github.trim()}</p> : null}
          {data.links.linkedin.trim() ? <p>LinkedIn: {data.links.linkedin.trim()}</p> : null}
        </div>
      ) : null}
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

function BuilderPage({ data, setData, scoreData, improvements, selectedTemplate, setSelectedTemplate }) {
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

          <ListSection
            title="Projects"
            items={data.projects}
            onAdd={() => addEntry('projects', { name: '', tech: '', description: '' })}
            renderItem={(item, index) => (
              <>
                <div className="grid-two">
                  <Field label="Name" value={item.name} onChange={(e) => updateListField('projects', index, 'name', e.target.value)} />
                  <Field label="Tech" value={item.tech} onChange={(e) => updateListField('projects', index, 'tech', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (one bullet per line)</label>
                  <textarea className="textarea" value={item.description} onChange={(e) => updateListField('projects', index, 'description', e.target.value)} />
                  <BulletGuidance text={item.description} />
                </div>
              </>
            )}
          />

          <section className="card form-card">
            <div className="card-header">Skills</div>
            <div className="card-body">
              <input
                className="input"
                value={data.skills}
                onChange={(e) => setData((prev) => ({ ...prev, skills: e.target.value }))}
                placeholder="React, JavaScript, Node.js"
              />
            </div>
          </section>

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
              <TemplateTabs selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} />
            </div>
          </section>
          <ScoreCard score={scoreData.score} suggestions={scoreData.suggestions} improvements={improvements} />
          <div className="card preview-card">
            <div className="card-header">Live Preview</div>
            <div className="card-body">
              <ResumeShell data={data} template={selectedTemplate} />
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

function PreviewPage({ data, selectedTemplate, setSelectedTemplate }) {
  const [copyStatus, setCopyStatus] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const exportWarnings = useMemo(() => getExportWarnings(data), [data])

  const handlePrint = () => {
    if (exportWarnings.length > 0) setShowWarning(true)
    window.print()
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
          <div className="card-header">Template</div>
          <div className="card-body">
            <TemplateTabs selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} />
          </div>
        </section>
        <section className="card preview-toolbar">
          <button type="button" className="btn btn-primary" onClick={handlePrint}>Print / Save as PDF</button>
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

        <div className="print-target">
          <ResumeShell data={data} template={selectedTemplate} monochrome />
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData))
  }, [resumeData])

  useEffect(() => {
    localStorage.setItem(TEMPLATE_KEY, selectedTemplate)
  }, [selectedTemplate])

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
          />
        }
      />
      <Route
        path="/preview"
        element={<PreviewPage data={resumeData} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />}
      />
      <Route path="/proof" element={<ProofPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
