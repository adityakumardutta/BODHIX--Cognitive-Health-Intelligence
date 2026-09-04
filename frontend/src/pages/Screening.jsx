import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useOffline } from '../services/offlineContext.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import RudasTaskCard from '../components/RudasTaskCard.jsx'

const SECTIONS = ['AD8', 'RUDAS', 'PFAQ']
const SECTION_NAMES = { AD8: 'AD8 Informant/Self Interview', RUDAS: 'RUDAS Cognitive Assessment', PFAQ: 'Functional Activities (PFAQ)' }

export default function Screening() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const { isOnline, queueScreening } = useOffline()

  const [sectionIndex, setSectionIndex] = useState(0)
  const [questionsBySection, setQuestionsBySection] = useState({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // questionId -> responseValue
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [startedAt] = useState(Date.now())

  const sectionCode = SECTIONS[sectionIndex]
  const questions = questionsBySection[sectionCode] || []
  const currentQuestion = questions[questionIndex]

  useEffect(() => {
    if (questionsBySection[sectionCode]) return
    setLoading(true)
    api.get(`/screenings/questions/${sectionCode}`)
      .then((qs) => setQuestionsBySection((prev) => ({ ...prev, [sectionCode]: qs })))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [sectionCode])

  const totalAnswered = Object.keys(answers).length

  async function handleNext() {
    const isLastInSection = questionIndex === questions.length - 1
    if (!isLastInSection) {
      setQuestionIndex((i) => i + 1)
      return
    }
    const isLastSection = sectionIndex === SECTIONS.length - 1
    if (!isLastSection) {
      setSectionIndex((i) => i + 1)
      setQuestionIndex(0)
      return
    }
    await submit()
  }

  function handleBack() {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1)
    } else if (sectionIndex > 0) {
      setSectionIndex((i) => i - 1)
      setQuestionIndex((questionsBySection[SECTIONS[sectionIndex - 1]]?.length || 1) - 1)
    }
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    const payload = {
      personId: Number(personId),
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      isOfflineCapture: !isOnline,
      answers: Object.entries(answers).map(([questionId, responseValue]) => ({
        questionId: Number(questionId),
        responseValue: String(responseValue),
      })),
    }

    if (!isOnline) {
      queueScreening(payload)
      navigate('/persons/' + personId, { state: { offlineQueued: true } })
      setSubmitting(false)
      return
    }

    try {
      const result = await api.post('/screenings', payload)
      navigate(`/screening/${personId}/result`, { state: { result } })
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const totalQuestionsInSection = questions.length

  if (loading && !currentQuestion) {
    return <p className="text-muted text-center py-12">Loading screening…</p>
  }

  if (error) {
    return <p className="text-warning text-center py-12">{error}</p>
  }

  if (!currentQuestion) {
    return <p className="text-muted text-center py-12">No questions configured for this section yet.</p>
  }

  return (
    <div className="py-4">
      {sectionCode === 'RUDAS' ? (
        <RudasTaskCard
          sectionName={SECTION_NAMES[sectionCode]}
          current={questionIndex + 1}
          total={totalQuestionsInSection}
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={(val) => setAnswers((a) => ({ ...a, [currentQuestion.id]: val }))}
          onBack={handleBack}
          onNext={handleNext}
          backDisabled={sectionIndex === 0 && questionIndex === 0}
          isLast={sectionIndex === SECTIONS.length - 1 && questionIndex === questions.length - 1}
        />
      ) : (
        <QuestionCard
          sectionName={SECTION_NAMES[sectionCode]}
          current={questionIndex + 1}
          total={totalQuestionsInSection}
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={(val) => setAnswers((a) => ({ ...a, [currentQuestion.id]: val }))}
          onBack={handleBack}
          onNext={handleNext}
          backDisabled={sectionIndex === 0 && questionIndex === 0}
          isLast={sectionIndex === SECTIONS.length - 1 && questionIndex === questions.length - 1}
        />
      )}
      {submitting && <p className="text-center text-sm text-muted mt-4">Saving screening…</p>}
    </div>
  )
}