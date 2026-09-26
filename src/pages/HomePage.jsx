import { useState } from 'react'
import CocktailCard from '../components/CocktailCard'
import { cocktails, bars } from '../data/cocktails'

const tasteCategories = [
  { label: 'Citrus & Bright', desc: 'Zesty, refreshing, high-acid', icon: '◎' },
  { label: 'Rich & Stirred', desc: 'Booze-forward, warming', icon: '◈' },
  { label: 'Tropical', desc: 'Fruit-led, summery', icon: '◆' },
  { label: 'Bitter & Herbal', desc: 'Complex, aperitif-style', icon: '◇' },
  { label: 'Floral & Delicate', desc: 'Light, fragrant, low-ABV', icon: '○' },
  { label: 'Smoky & Dark', desc: 'Mezcal, peated whisky', icon: '●' },
  { label: 'Sweet & Fruity', desc: 'Juicy, approachable, easy-drinking', icon: '✦' },
  { label: 'Sour & Refreshing', desc: 'Tart, crisp, lively', icon: '◐' },
]

const experienceCategories = [
  { label: 'After Dinner', desc: 'Digestifs, contemplative sips' },
  { label: 'First Date', desc: 'Accessible, crowd-pleasing' },
  { label: 'Business Drinks', desc: 'Polished and professional' },
  { label: 'Weekend Unwind', desc: 'Relaxed, leisurely pacing' },
]

const sectionTitleStyle = {
  fontFamily: 'Fraunces, serif',
  fontWeight: 300,
  fontSize: '28px',
  color: '#F0EBE1',
  margin: 0,
}

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '24px',
  marginBottom: '24px',
}

export default function HomePage({ onNavigate, quizAnswers, onSelectCocktail }) {
  const [heroHovered, setHeroHovered] = useState(false)
  const featuredBar = bars[0]
  const popularCocktails = cocktails.slice(0, 4)
  const goToCocktails = cocktails.slice(0, 3)
  const personalizedCocktails = cocktails.slice(2, 6)

  const hr = () => (
    <div style={{ borderTop: '1px solid rgba(240,235,225,0.08)', margin: '0 0 48px' }} />
  )

  return (
    <div className="home-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 96px' }}>

      {/* ── Hero ── */}
      {quizAnswers ? (
        // Post-quiz / returning user hero
        <section style={{ padding: '72px 0 56px' }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#9C9589',
            marginBottom: '12px',
          }}>
            Good evening
          </p>
          <h1 style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 300,
            fontSize: 'clamp(36px, 5vw, 60px)',
            color: '#F0EBE1',
            lineHeight: 1.1,
            margin: '0 0 32px',
            fontStyle: 'italic',
          }}>
            Welcome back, Marcus.
          </h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {goToCocktails.map(c => (
              <div key={c.id} style={{
                backgroundColor: '#232220',
                border: '1px solid rgba(240,235,225,0.08)',
                padding: '14px 18px',
                minWidth: '180px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(184,134,62,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(240,235,225,0.08)')}
              >
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 300, color: '#F0EBE1', margin: '0 0 4px' }}>{c.name}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9C9589', margin: 0 }}>Last had at {c.bar}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate('bars')}
            style={{
              backgroundColor: '#B8863E',
              color: '#2E1F0C',
              border: 'none',
              padding: '12px 28px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
            Find a Bar Nearby
          </button>
        </section>
      ) : (
        // New user hero — no inline quiz
        <section className="home-hero home-reveal" style={{
          padding: '40px 0 0',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.08fr) minmax(360px, 0.92fr)',
          gap: '44px',
          alignItems: 'center',
          marginBottom: '42px',
        }}>
          <div className="home-hero-copy">
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#B8863E',
              marginBottom: '16px',
            }}>
              Singapore's cocktail compass
            </p>
            <h1 className="home-hero-title" style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 300,
              fontSize: 'clamp(38px, 4vw, 56px)',
              color: '#F0EBE1',
              lineHeight: 1.08,
              margin: '0 0 20px',
              fontStyle: 'italic',
            }}>
              Find the drink<br />that finds you.
            </h1>
            <p className="home-hero-description" style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              color: '#9C9589',
              lineHeight: 1.7,
              marginBottom: '36px',
              maxWidth: '400px',
            }}>
              Discover cocktails matched to your palate and the bars that pour them best. No guesswork, no generic lists.
            </p>
            <div className="home-hero-actions">
              <button
                onClick={() => onNavigate('quiz')}
                className="home-primary-action"
              >
                Take the Taste Quiz
              </button>
              <button
                onClick={() => onNavigate('explorer')}
                className="home-secondary-action"
              >
                Browse all cocktails →
              </button>
            </div>
          </div>

          {/* Hero image */}
          <div
            className="home-hero-image"
            onMouseEnter={() => setHeroHovered(true)}
            onMouseLeave={() => setHeroHovered(false)}
            style={{
              position: 'relative',
              aspectRatio: '4/3',
              maxHeight: '380px',
              overflow: 'hidden',
              backgroundColor: '#2C2A27',
              border: '1px solid rgba(240,235,225,0.08)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1500217052183-bc01eee1a74e?w=600&h=800&fit=crop&auto=format"
              alt="Cocktail close-up"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: heroHovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.6s ease',
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(26,25,24,0.6) 0%, transparent 50%)',
            }} />
            <div className="home-hero-caption">
              <span>Featured pour</span>
              Jungle Bird
            </div>
          </div>
        </section>
      )}

      {/* ── Your Go-To Cocktails (post-quiz only) ── */}
      {quizAnswers && (
        <section className="home-reveal" style={{ marginBottom: '72px' }}>
          <div style={sectionHeaderStyle}>
            <div>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                color: '#B8863E',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}>
                Because you said you like {quizAnswers.flavor.toLowerCase()}
              </p>
              <h2 style={sectionTitleStyle}>
                Your Go-To Cocktails
              </h2>
            </div>
            <button
              onClick={() => onNavigate('explorer')}
              style={{
                background: 'none',
                border: 'none',
                color: '#B8863E',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: 500,
              }}>
              View All →
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {personalizedCocktails.map(c => (
              <CocktailCard
                key={c.id}
                cocktail={c}
                onClick={() => onSelectCocktail(c)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Popular in Singapore — always shown, label never changes ── */}
      <section className="home-reveal" style={{ marginBottom: '72px', animationDelay: '100ms' }}>
        <div style={sectionHeaderStyle}>
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              color: '#B8863E',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              margin: '0 0 6px',
            }}>
              Trending now
            </p>
            <h2 style={sectionTitleStyle}>
              Popular in Singapore
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explorer')}
            style={{
              background: 'none',
              border: 'none',
              color: '#B8863E',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontWeight: 500,
            }}>
            View All →
          </button>
        </div>
        <div className="popular-cocktail-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '14px',
        }}>
          {popularCocktails.map((c, index) => (
            <CocktailCard
              key={c.id}
              cocktail={c}
              compact
              rank={index === 0 ? undefined : index + 1}
              badge={index === 0 ? 'Most popular' : undefined}
              onClick={() => onSelectCocktail(c)}
            />
          ))}
        </div>
      </section>

      {hr()}

      {/* ── Browse by Taste ── */}
      <section className="home-reveal" style={{ marginBottom: '72px', animationDelay: '160ms' }}>
        <h2 style={{ ...sectionTitleStyle, marginBottom: '24px' }}>Browse by Taste</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1px',
          backgroundColor: 'rgba(240,235,225,0.08)',
        }}>
          {tasteCategories.map(cat => (
            <button
              key={cat.label}
              onClick={() => onNavigate('explorer')}
              style={{
                backgroundColor: '#232220',
                border: 'none',
                padding: '24px 20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2C2A27')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#232220')}
            >
              <div style={{ fontSize: '18px', color: '#B8863E', marginBottom: '10px' }}>{cat.icon}</div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: '#F0EBE1', margin: '0 0 4px' }}>{cat.label}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9C9589', margin: 0 }}>{cat.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Browse by Experience ── */}
      <section className="home-reveal" style={{ marginBottom: '72px', animationDelay: '220ms' }}>
        <h2 style={{ ...sectionTitleStyle, marginBottom: '24px' }}>Browse by Experience</h2>
        <div className="home-experience-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '10px',
        }}>
          {experienceCategories.map(exp => (
            <button
              key={exp.label}
              onClick={() => onNavigate('explorer')}
              style={{
                backgroundColor: '#232220',
                border: '1px solid rgba(240,235,225,0.08)',
                padding: '14px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
                minWidth: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#2C2A27'
                e.currentTarget.style.borderColor = 'rgba(184,134,62,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#232220'
                e.currentTarget.style.borderColor = 'rgba(240,235,225,0.08)'
              }}
            >
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: '#F0EBE1', margin: '0 0 4px' }}>{exp.label}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9C9589', margin: 0 }}>{exp.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {hr()}

      {/* ── Featured Bar ── */}
      <section className="home-reveal" style={{ animationDelay: '280ms' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>Featured Bar</h2>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            color: '#C9B896',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            border: '1px solid rgba(201,184,150,0.35)',
            padding: '3px 10px',
          }}>Partner</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          border: '1px solid rgba(201,184,150,0.25)',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', minHeight: '320px', backgroundColor: '#2C2A27' }}>
            <img
              src={`${featuredBar.img}?w=600&h=400&fit=crop&auto=format`}
              alt={featuredBar.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, transparent 60%, rgba(26,25,24,0.8))',
            }} />
          </div>
          <div style={{
            backgroundColor: '#232220',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#C9B896',
              marginBottom: '14px',
            }}>
              {featuredBar.neighborhood} · {featuredBar.vibe}
            </p>
            <h3 style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 300,
              fontSize: '32px',
              color: '#F0EBE1',
              margin: '0 0 8px',
              fontStyle: 'italic',
            }}>
              {featuredBar.name}
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#9C9589',
              marginBottom: '16px',
            }}>
              Known for the <em style={{ color: '#F0EBE1' }}>{featuredBar.cocktail}</em>
            </p>
            {featuredBar.promo && (
              <div style={{
                backgroundColor: 'rgba(201,184,150,0.08)',
                border: '1px solid rgba(201,184,150,0.2)',
                padding: '10px 14px',
                marginBottom: '24px',
              }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#C9B896', margin: 0 }}>
                  {featuredBar.promo}
                </p>
              </div>
            )}
            <button
              onClick={() => onNavigate('bars')}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#B8863E',
                color: '#2E1F0C',
                border: 'none',
                padding: '12px 24px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}>
              View Bar
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
