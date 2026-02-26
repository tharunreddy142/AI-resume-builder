export const buildSteps = [
  { number: 1, slug: '01-problem', title: 'Problem' },
  { number: 2, slug: '02-market', title: 'Market' },
  { number: 3, slug: '03-architecture', title: 'Architecture' },
  { number: 4, slug: '04-hld', title: 'HLD' },
  { number: 5, slug: '05-lld', title: 'LLD' },
  { number: 6, slug: '06-build', title: 'Build' },
  { number: 7, slug: '07-test', title: 'Test' },
  { number: 8, slug: '08-ship', title: 'Ship' },
]

export const artifactKey = (stepNumber) => `rb_step_${stepNumber}_artifact`

export function readArtifacts() {
  return buildSteps.reduce((acc, step) => {
    acc[step.number] = localStorage.getItem(artifactKey(step.number)) || ''
    return acc
  }, {})
}

export function firstIncompleteStep(artifacts) {
  const pending = buildSteps.find((step) => !artifacts[step.number])
  return pending?.number || null
}

export function routeForStep(stepNumber) {
  const step = buildSteps.find((entry) => entry.number === stepNumber)
  return step ? `/rb/${step.slug}` : '/rb/01-problem'
}
