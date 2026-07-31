import { useState } from 'react'
import { bars } from '../data/cocktails'

const VIBE_COLORS = {
  Classic: '#B8863E',
  Speakeasy: '#9C9589',
  Rooftop: '#B8863E',
  Casual: '#9C9589',
  'Live Music': '#9C9589',
}

const sgNeighborhoods = [
  { name: 'Clarke Quay', top: '48%', left: '30%' },
  { name: 'Raffles Place', top: '52%', left: '40%' },
  { name: 'Tanjong Pagar', top: '60%', left: '38%' },
  { name: 'Ann Siang', top: '57%', left: '42%' },
  { name: 'Bugis', top: '35%', left: '45%' },
  { name: 'CBD', top: '50%', left: '44%' },
]

export default function BarsPage() {
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [hoveredPin, setHoveredPin] = useState(null)
  const [selectedBar, setSelectedBar] = useState(null)

  const partnerBars = bars.filter(b => b.partner)

  const prev = () => setCarouselIdx(i => (i - 1 + partnerBars.length) % partnerBars.length)
  const next = () => setCarouselIdx(i => (i + 1) % partnerBars.length)
  const visible = partnerBars.slice(carouselIdx, carouselIdx + 3).concat(
    carouselIdx + 3 > partnerBars.length ? partnerBars.slice(0, (carouselIdx + 3) % partnerBars.length) : []
  )

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px 96px' }}>
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 300,
          fontSize: '40px',
          color: '#F0EBE1',
          margin: '0 0 6px',
          fontStyle: 'italic',
        }}>Bars</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#9C9589', margin: 0 }}>
          Partner venues and the full Singapore map
        </p>
      </div>

      {/* Partner Carousel */}
      <section style={{ marginBottom: '72px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h2 style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 300,
              fontSize: '24px',
              color: '#F0EBE1',
              margin: 0,
            }}>Partner Bars</h2>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              color: '#C9B896',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              border: '1px solid rgba(201,184,150,0.35)',
              padding: '2px 8px',
            }}>Featured</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={prev} style={{
              width: '32px', height: '32px',
              backgroundColor: '#232220',
              border: '1px solid rgba(240,235,225,0.12)',
              color: '#F0EBE1',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>‹</button>
            <button onClick={next} style={{
              width: '32px', height: '32px',
              backgroundColor: '#232220',
              border: '1px solid rgba(240,235,225,0.12)',
              color: '#F0EBE1',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>›</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {visible.map((bar, i) => (
            <BarCard key={`${bar.id}-${i}`} bar={bar} champagne={i === 0} />
          ))}
        </div>
      </section>

      {/* Map */}
      <section>
        <h2 style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 300,
          fontSize: '24px',
          color: '#F0EBE1',
          margin: '0 0 24px',
        }}>All Bars in Singapore</h2>

        <div style={{
          position: 'relative',
          backgroundColor: '#232220',
          border: '1px solid rgba(240,235,225,0.08)',
          height: '480px',
          overflow: 'hidden',
        }}>
          {/* Stylized map background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(240,235,225,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(240,235,225,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />

          {/* Singapore outline suggestion */}
          <div style={{
            position: 'absolute',
            top: '25%', left: '15%',
            right: '15%', bottom: '25%',
            border: '1px solid rgba(240,235,225,0.06)',
            borderRadius: '40% 50% 45% 55%',
          }} />

          {/* Water fill */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '28%',
            backgroundColor: 'rgba(184,134,62,0.04)',
            borderTop: '1px solid rgba(184,134,62,0.08)',
          }} />
          <p style={{
            position: 'absolute',
            bottom: '8px', left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(184,134,62,0.4)',
            margin: 0,
          }}>Strait of Singapore</p>

          {/* Neighborhood labels */}
          {sgNeighborhoods.map(n => (
            <p key={n.name} style={{
              position: 'absolute',
              top: n.top, left: n.left,
              fontFamily: 'Inter, sans-serif',
              fontSize: '9px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(156,149,137,0.4)',
              margin: 0,
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
            }}>{n.name}</p>
          ))}

          {/* Bar pins */}
          {bars.map((bar, i) => {
            const positions = [
              { top: '45%', left: '31%' },
              { top: '50%', left: '41%' },
              { top: '58%', left: '39%' },
              { top: '55%', left: '43%' },
              { top: '43%', left: '46%' },
            ]
            const pos = positions[i] || { top: '50%', left: '50%' }
            const isHovered = hoveredPin === bar.id
            const isSelected = selectedBar === bar.id

            return (
              <div key={bar.id} style={{ position: 'absolute', top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}>
                <button
                  onMouseEnter={() => setHoveredPin(bar.id)}
                  onMouseLeave={() => setHoveredPin(null)}
                  onClick={() => setSelectedBar(selectedBar === bar.id ? null : bar.id)}
                  style={{
                    width: isHovered || isSelected ? '14px' : '10px',
                    height: isHovered || isSelected ? '14px' : '10px',
                    borderRadius: '50%',
                    backgroundColor: bar.partner ? '#B8863E' : '#9C9589',
                    border: isSelected ? '2px solid #F0EBE1' : '2px solid #1A1918',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'block',
                    padding: 0,
                  }}
                />
                {(isHovered || isSelected) && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#232220',
                    border: `1px solid ${bar.partner ? 'rgba(184,134,62,0.35)' : 'rgba(240,235,225,0.12)'}`,
                    padding: '12px 16px',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    minWidth: '180px',
                  }}>
                    <p style={{ fontFamily: 'Fraunces, serif', fontSize: '14px', fontWeight: 300, color: '#F0EBE1', margin: '0 0 4px' }}>{bar.name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: VIBE_COLORS[bar.vibe] || '#9C9589', margin: '0 0 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{bar.vibe}</p>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#B8863E',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: 0,
                      letterSpacing: '0.06em',
                    }}>View more →</button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Legend */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(35,34,32,0.9)',
            border: '1px solid rgba(240,235,225,0.08)',
            padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#B8863E' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9C9589' }}>Partner bar</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9C9589' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9C9589' }}>Bar</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function BarCard({ bar, champagne }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#2C2A27' : '#232220',
        border: champagne ? '1px solid rgba(201,184,150,0.3)' : '1px solid rgba(240,235,225,0.08)',
        overflow: 'hidden',
        transition: 'background-color 0.2s',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: '#2C2A27', overflow: 'hidden' }}>
        <img
          src={`${bar.img}?w=480&h=360&fit=crop&auto=format`}
          alt={bar.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}
        />
        {bar.promo && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: '#C9B896',
            color: '#3D2E14',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            fontFamily: 'Inter, sans-serif',
          }}>
            Offer
          </div>
        )}
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <h3 style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '17px',
            fontWeight: 300,
            color: '#F0EBE1',
            margin: 0,
            fontStyle: 'italic',
          }}>{bar.name}</h3>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9C9589', margin: '0 0 14px' }}>
          {bar.neighborhood} · <span style={{ color: VIBE_COLORS[bar.vibe] || '#9C9589' }}>{bar.vibe}</span>
        </p>
        {bar.promo && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: champagne ? '#C9B896' : '#B8863E', margin: '0 0 14px' }}>
            {bar.promo}
          </p>
        )}
        <button style={{
          backgroundColor: 'transparent',
          border: `1px solid ${champagne ? 'rgba(201,184,150,0.4)' : 'rgba(184,134,62,0.4)'}`,
          color: champagne ? '#C9B896' : '#B8863E',
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '8px 16px',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}>
          View Bar
        </button>
      </div>
    </div>
  )
}
