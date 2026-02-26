import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useMemo, useState } from 'react'

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
    'Frontend engineer focused on shipping clean, performant web interfaces with strong product thinking.',
  education: [{ school: 'State University', degree: 'B.S. Computer Science', start: '2019', end: '2023' }],
  experience: [
    {
      company: 'Northlane Tech',
      role: 'Software Engineer',
      start: '2023',
      end: 'Present',
      details: 'Built dashboard features and internal tools for recruiter workflow automation.',
    },
  ],
  projects: [
    {
      name: 'TaskFlow',
      tech: 'React, Node.js',
      description: 'Collaborative project tracker with role-based access and real-time notifications.',
    },
  ],
  skills: 'React, JavaScript, TypeScript, Node.js, SQL, REST APIs',
  links: {
    github: 'github.com/aaravsharma',
    linkedin: 'linkedin.com/in/aaravsharma',
  },
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

function ResumeShell({ data, monochrome = false }) {
  const containerClass = monochrome ? 'resume-shell monochrome' : 'resume-shell'
  return (
    <section className={containerClass}>
      <h2 className="resume-name">{data.personal.name || 'Your Name'}</h2>
      <p className="resume-meta">
        {data.personal.email || 'email@example.com'} | {data.personal.phone || 'Phone'} | {data.personal.location || 'Location'}
      </p>

      <div className="resume-block">
        <h3>Summary</h3>
        <p>{data.summary || 'Professional summary appears here.'}</p>
      </div>

      <div className="resume-block">
        <h3>Education</h3>
        {data.education.map((item, idx) => (
          <p key={idx}>{item.degree || 'Degree'} - {item.school || 'Institution'} ({item.start || 'Start'} - {item.end || 'End'})</p>
        ))}
      </div>

      <div className="resume-block">
        <h3>Experience</h3>
        {data.experience.map((item, idx) => (
          <p key={idx}>{item.role || 'Role'} - {item.company || 'Company'} ({item.start || 'Start'} - {item.end || 'End'})</p>
        ))}
      </div>

      <div className="resume-block">
        <h3>Projects</h3>
        {data.projects.map((item, idx) => (
          <p key={idx}>{item.name || 'Project'} | {item.tech || 'Tech Stack'}</p>
        ))}
      </div>

      <div className="resume-block">
        <h3>Skills</h3>
        <p>{data.skills || 'Skills list appears here.'}</p>
      </div>
    </section>
  )
}

function BuilderPage({ data, setData }) {
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
        <p className="context-header__subtitle">Structure first. Scoring and export will be added later.</p>
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
                  <label className="form-label">Details</label>
                  <textarea className="textarea" value={item.details} onChange={(e) => updateListField('experience', index, 'details', e.target.value)} />
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
                  <label className="form-label">Description</label>
                  <textarea className="textarea" value={item.description} onChange={(e) => updateListField('projects', index, 'description', e.target.value)} />
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
          <div className="card preview-card">
            <div className="card-header">Live Preview</div>
            <div className="card-body">
              <ResumeShell data={data} />
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

function PreviewPage({ data }) {
  return (
    <div className="page-wrapper preview-page">
      <TopNav />
      <main className="preview-main">
        <ResumeShell data={data} monochrome />
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
  const [resumeData, setResumeData] = useState(emptyResume)
  const hasData = useMemo(() => resumeData.personal.name || resumeData.summary, [resumeData])
  const previewData = hasData ? resumeData : emptyResume

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/builder" element={<BuilderPage data={resumeData} setData={setResumeData} />} />
      <Route path="/preview" element={<PreviewPage data={previewData} />} />
      <Route path="/proof" element={<ProofPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
