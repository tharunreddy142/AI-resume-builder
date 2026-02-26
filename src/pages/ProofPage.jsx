import { useMemo, useState } from 'react'
import { buildSteps, readArtifacts } from '../lib/steps'

export default function ProofPage() {
  const artifacts = useMemo(() => readArtifacts(), [])
  const [lovableLink, setLovableLink] = useState('')
  const [githubLink, setGithubLink] = useState('')
  const [deployLink, setDeployLink] = useState('')

  const completedCount = useMemo(
    () => Object.values(artifacts).filter(Boolean).length,
    [artifacts],
  )

  const copyFinalSubmission = async () => {
    const lines = [
      'AI Resume Builder - Build Track',
      `Steps Complete: ${completedCount}/8`,
      ...buildSteps.map((step) => `Step ${step.number}: ${artifacts[step.number] ? 'Done' : 'Pending'}`),
      `Lovable: ${lovableLink || 'N/A'}`,
      `GitHub: ${githubLink || 'N/A'}`,
      `Deploy: ${deployLink || 'N/A'}`,
    ]
    await navigator.clipboard.writeText(lines.join('\n'))
  }

  return (
    <div className="page-wrapper">
      <header className="topbar">
        <div className="topbar__left">AI Resume Builder</div>
        <div className="topbar__center">Project 3 - Proof</div>
        <div className="topbar__right">
          <span className={`badge ${completedCount === 8 ? 'badge-success' : 'badge-progress'}`}>
            {completedCount}/8 Completed
          </span>
        </div>
      </header>

      <section className="context-header">
        <h1 className="context-header__title">Proof Submission</h1>
        <p className="context-header__subtitle">Submit all links once all eight build steps are complete.</p>
      </section>

      <div className="main-content proof-main">
        <section className="workspace">
          <h2 className="card-header">8 Step Status</h2>
          <div className="card status-list">
            {buildSteps.map((step) => (
              <div key={step.number} className="proof-status-row">
                <span>Step {step.number} - {step.title}</span>
                <span className={`badge ${artifacts[step.number] ? 'badge-success' : 'badge-default'}`}>
                  {artifacts[step.number] ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="sidebar">
          <div className="form-group">
            <label className="form-label" htmlFor="lovableLink">Lovable link</label>
            <input id="lovableLink" className="input" value={lovableLink} onChange={(e) => setLovableLink(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="githubLink">GitHub link</label>
            <input id="githubLink" className="input" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="deployLink">Deploy link</label>
            <input id="deployLink" className="input" value={deployLink} onChange={(e) => setDeployLink(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" onClick={copyFinalSubmission}>
            Copy Final Submission
          </button>
        </aside>
      </div>
    </div>
  )
}
