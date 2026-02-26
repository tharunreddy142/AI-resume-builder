import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { buildSteps } from '../lib/steps'

function statusText(completed) {
  if (completed === 8) return 'Complete'
  return `In Progress (${completed}/8)`
}

export default function BuildLayout({
  currentStep,
  artifact,
  onArtifactChange,
  onArtifactSave,
  onCopyPrompt,
  onMarkWorked,
  onMarkError,
  onGoNext,
  onGoBack,
  isNextEnabled,
  stepStatuses,
}) {
  const completed = useMemo(
    () => Object.values(stepStatuses).filter(Boolean).length,
    [stepStatuses],
  )

  return (
    <div className="page-wrapper">
      <header className="topbar">
        <div className="topbar__left">AI Resume Builder</div>
        <div className="topbar__center">Project 3 - Step {currentStep.number} of 8</div>
        <div className="topbar__right">
          <span className={`badge ${completed === 8 ? 'badge-success' : 'badge-progress'}`}>
            {statusText(completed)}
          </span>
        </div>
      </header>

      <section className="context-header">
        <h1 className="context-header__title">{currentStep.title}</h1>
        <p className="context-header__subtitle">
          Build Track gating is active. Upload an artifact before moving forward.
        </p>
      </section>

      <div className="main-content">
        <section className="workspace">
          <h2 className="card-header">Main Workspace</h2>
          <div className="card">
            <div className="card-body">
              <p>
                Route: <code>/rb/{currentStep.slug}</code>
              </p>
              <p>
                This step is locked to sequential progression. Next is enabled only after artifact upload.
              </p>
            </div>
          </div>

          <div className="step-actions">
            <button className="btn btn-secondary" onClick={onGoBack} disabled={currentStep.number === 1}>
              Back
            </button>
            <button className="btn btn-primary" onClick={onGoNext} disabled={!isNextEnabled}>
              Next
            </button>
          </div>
        </section>

        <aside className="sidebar">
          <div className="form-group">
            <label className="form-label" htmlFor="copyPrompt">Copy This Into Lovable</label>
            <textarea
              id="copyPrompt"
              className="textarea"
              value={`Project 3 Step ${currentStep.number}: ${currentStep.title}. Do not skip gating.`}
              readOnly
            />
          </div>

          <button className="btn btn-secondary btn-block" onClick={onCopyPrompt}>Copy</button>
          <button className="btn btn-primary btn-block" type="button">Build in Lovable</button>

          <div className="status-row">
            <button className="btn btn-secondary" onClick={onMarkWorked}>It Worked</button>
            <button className="btn btn-ghost" onClick={onMarkError}>Error</button>
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="artifactInput">Add Screenshot</label>
            <textarea
              id="artifactInput"
              className="textarea"
              placeholder="Paste screenshot URL / evidence"
              value={artifact}
              onChange={(event) => onArtifactChange(event.target.value)}
            />
            <button className="btn btn-primary btn-block" onClick={onArtifactSave}>
              Upload Artifact
            </button>
          </div>
        </aside>
      </div>

      <footer className="proof-footer">
        <div className="proof-footer__content">
          <div className="proof-footer__title">Proof Footer</div>
          <div className="proof-checklist">
            {buildSteps.map((step) => (
              <div className="proof-item" key={step.number}>
                <span className={`dot ${stepStatuses[step.number] ? 'dot--ok' : 'dot--todo'}`} />
                <span>Step {step.number}</span>
              </div>
            ))}
            <Link className="btn btn-secondary" to="/rb/proof">Open Proof</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
