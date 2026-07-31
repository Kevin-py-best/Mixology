import { useState } from 'react'

const questions = [
  {
    key: 'spirit',
    label: 'What spirit do you reach for?',
    options: [
      { value: 'Vodka', desc: null },
      { value: 'Gin', desc: null },
      { value: 'Whiskey', desc: null },
      { value: 'Rum', desc: null },
      { value: 'Tequila', desc: null },
      { value: 'Surprise me', desc: null },
    ],
  },
  {
    key: 'flavor',
    label: 'What flavor profile calls to you?',
    options: [
      { value: 'Citrus & Bright', desc: 'Zesty, refreshing, high-acid' },
      { value: 'Rich & Stirred', desc: 'Booze-forward, warming, complex' },
      { value: 'Tropical', desc: 'Fruit-led, summery, easy-drinking' },
      { value: 'Bitter & Herbal', desc: 'Aperitif-style, layered, acquired' },
      { value: 'Floral & Delicate', desc: 'Light, fragrant, low-ABV' },
      { value: 'Smoky & Dark', desc: 'Mezcal, peated whisky, earthy depth' },
    ],
  },
  {
    key: 'strength',
    label: 'How strong do you like it?',
    options: [
      { value: 'Light & Easy', desc: 'Under 8% ABV — approachable, sessionable' },
      { value: 'Balanced', desc: '8–18% — enough presence without the weight' },
      { value: 'Strong & Bold', desc: 'Over 18% — spirit-forward, built to sip slowly' },
    ],
  },
  {
    key: 'occasion',
    label: "What's the occasion, most often?",
    options: [
      { value: 'After Dinner', desc: 'Digestifs and contemplative sips' },
      { value: 'First Date', desc: 'Accessible, crowd-pleasing, never wrong' },
      { value: 'Business Drinks', desc: 'Polished, measured, professional' },
      { value: 'Weekend Unwind', desc: 'Relaxed pacing, nothing to prove' },
    ],
  },
]

export default function QuizPage({ onComplete, onBack }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const q = questions[step]
  const current = answers[q.key] ?? ''
  const isLast = step === questions.length - 1

  const goNext = () => {
    if (!current) return
    if (isLast) {
      onComplete(answers)
    } else {
      setStep(s => s + 1)
    }
  }

  const goPrev = () => {
    if (step === 0) onBack()
    else setStep(s => s - 1)
  }

  const select = (val) => {
    setAnswers(a => ({ ...a, [q.key]: val }))
  }

  const progressFill = ((step + (current ? 1 : 0)) / questions.length) * 100

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1A1918',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Progress bar */}
      <div style={{
        height: '2px',
        backgroundColor: 'rgba(240,235,225,0.08)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}>
        <div style={{
          height: '100%',
          backgroundColor: '#B8863E',
          width: `${progressFill}%`,
          transition: 'width 0.35s ease',
        }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 120px',
      }}>
        <div style={{ width: '100%', maxWidth: '620px' }}>
          {/* Step label */}
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#9C9589',
            margin: '0 0 28px',
          }}>
            Question {step + 1} of {questions.length}
          </p>

          {/* Question */}
          <h2 style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(26px, 4vw, 38px)',
            color: '#F0EBE1',
            lineHeight: 1.2,
            margin: '0 0 36px',
          }}>
            {q.label}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '48px' }}>
            {q.options.map(opt => {
              const selected = current === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => select(opt.value)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: opt.desc ? '16px 20px' : '14px 20px',
                    backgroundColor: selected ? 'rgba(184,134,62,0.08)' : '#232220',
                    border: selected
                      ? '1px solid rgba(184,134,62,0.55)'
                      : '1px solid rgba(240,235,225,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: opt.desc ? 'flex-start' : 'center',
                    gap: '14px',
                  }}
                  onMouseEnter={e => {
                    if (!selected) e.currentTarget.style.borderColor = 'rgba(240,235,225,0.18)'
                  }}
                  onMouseLeave={e => {
                    if (!selected) e.currentTarget.style.borderColor = 'rgba(240,235,225,0.08)'
                  }}
                >
                  {/* Radio indicator */}
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: selected ? '1px solid #B8863E' : '1px solid rgba(240,235,225,0.2)',
                    flexShrink: 0,
                    marginTop: opt.desc ? '2px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'border-color 0.15s',
                  }}>
                    {selected && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#B8863E',
                      }} />
                    )}
                  </div>

                  <div>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: selected ? '#F0EBE1' : '#9C9589',
                      margin: opt.desc ? '0 0 3px' : '0',
                      transition: 'color 0.15s',
                    }}>
                      {opt.value}
                    </p>
                    {opt.desc && (
                      <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        color: selected ? 'rgba(240,235,225,0.55)' : 'rgba(156,149,137,0.6)',
                        margin: 0,
                        transition: 'color 0.15s',
                      }}>
                        {opt.desc}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={goPrev}
              style={{
                background: 'none',
                border: 'none',
                color: '#9C9589',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '10px 0',
                letterSpacing: '0.02em',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F0EBE1')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9C9589')}
            >
              ← {step === 0 ? 'Back to home' : 'Back'}
            </button>

            <button
              onClick={goNext}
              disabled={!current}
              style={{
                backgroundColor: current ? '#B8863E' : '#2C2A27',
                color: current ? '#2E1F0C' : '#9C9589',
                border: 'none',
                padding: '12px 32px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: current ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              {isLast ? 'See my recommendations' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* Back link at bottom-left */}
      <div style={{
        position: 'fixed',
        bottom: '32px',
        left: '32px',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(156,149,137,0.5)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9C9589')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(156,149,137,0.5)')}
        >
          ← Back to home
        </button>
      </div>

      {/* Logo watermark */}
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <span style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '17px',
          fontWeight: 300,
          letterSpacing: '0.04em',
          color: 'rgba(240,235,225,0.25)',
          fontStyle: 'italic',
        }}>
          Mixology
        </span>
      </div>
    </div>
  )
}
