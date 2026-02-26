import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import BuildLayout from './components/BuildLayout'
import ProofPage from './pages/ProofPage'
import { artifactKey, buildSteps, firstIncompleteStep, readArtifacts, routeForStep } from './lib/steps'

function StepRoute({ stepNumber }) {
  const navigate = useNavigate()
  const currentStep = buildSteps.find((step) => step.number === stepNumber)
  const [artifact, setArtifact] = useState(localStorage.getItem(artifactKey(stepNumber)) || '')
  const [refreshTick, setRefreshTick] = useState(0)

  const artifacts = useMemo(() => readArtifacts(), [refreshTick])
  const firstIncomplete = firstIncompleteStep(artifacts)

  if (firstIncomplete && stepNumber > firstIncomplete) {
    return <Navigate to={routeForStep(firstIncomplete)} replace />
  }

  const isCurrentUploaded = Boolean(artifacts[stepNumber])

  const onArtifactSave = () => {
    const clean = artifact.trim()
    if (!clean) return
    localStorage.setItem(artifactKey(stepNumber), clean)
    setArtifact(clean)
    setRefreshTick((value) => value + 1)
  }

  const onCopyPrompt = async () => {
    await navigator.clipboard.writeText(
      `Project 3 Step ${currentStep.number}: ${currentStep.title}. Do not skip gating.`,
    )
  }

  const onGoNext = () => {
    if (!isCurrentUploaded) return
    const nextStep = stepNumber + 1
    if (nextStep > 8) {
      navigate('/rb/proof')
      return
    }
    navigate(routeForStep(nextStep))
  }

  const onGoBack = () => {
    const prevStep = stepNumber - 1
    if (prevStep < 1) return
    navigate(routeForStep(prevStep))
  }

  const stepStatuses = buildSteps.reduce((acc, step) => {
    acc[step.number] = Boolean(artifacts[step.number])
    return acc
  }, {})

  return (
    <BuildLayout
      currentStep={currentStep}
      artifact={artifact}
      onArtifactChange={setArtifact}
      onArtifactSave={onArtifactSave}
      onCopyPrompt={onCopyPrompt}
      onMarkWorked={() => {}}
      onMarkError={() => {}}
      onGoNext={onGoNext}
      onGoBack={onGoBack}
      isNextEnabled={isCurrentUploaded}
      stepStatuses={stepStatuses}
    />
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/rb/01-problem" replace />} />
      <Route path="/rb/01-problem" element={<StepRoute stepNumber={1} />} />
      <Route path="/rb/02-market" element={<StepRoute stepNumber={2} />} />
      <Route path="/rb/03-architecture" element={<StepRoute stepNumber={3} />} />
      <Route path="/rb/04-hld" element={<StepRoute stepNumber={4} />} />
      <Route path="/rb/05-lld" element={<StepRoute stepNumber={5} />} />
      <Route path="/rb/06-build" element={<StepRoute stepNumber={6} />} />
      <Route path="/rb/07-test" element={<StepRoute stepNumber={7} />} />
      <Route path="/rb/08-ship" element={<StepRoute stepNumber={8} />} />
      <Route path="/rb/proof" element={<ProofPage />} />
      <Route path="*" element={<Navigate to="/rb/01-problem" replace />} />
    </Routes>
  )
}
