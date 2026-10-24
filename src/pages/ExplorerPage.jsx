import { useEffect, useRef, useState, useMemo } from 'react'
import CocktailCard from '../components/CocktailCard'
import { cocktails } from '../data/cocktails'

const FLAVORS = ['Citrus', 'Tropical', 'Bitter', 'Floral', 'Sour', 'Fruity', 'Nutty', 'Rich']
const SPIRITS = ['Gin', 'Rum', 'Whisky', 'Bourbon', 'Tequila', 'Vodka']
const OCCASIONS = ['After Dinner', 'First Date', 'Business Drinks', 'Weekend Unwind']
const STRENGTHS = ['Low (Under 8% ABV)', 'Medium (8–18%)', 'Strong (Over 18%)']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function ExplorerPage({ searchQuery, onSelectCocktail }) {
  const [selectedFlavors, setSelectedFlavors] = useState([])
  const [selectedSpirits, setSelectedSpirits] = useState([])
  const [selectedOccasions, setSelectedOccasions] = useState([])
  const [strength, setStrength] = useState('')
  const [level, setLevel] = useState('')
  const [sort, setSort] = useState('Popularity')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sheet = useRef(null)

  useEffect(() => {
    if (!sidebarOpen) return
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sheet.current?.querySelector('button')?.focus()
    const handleKeys = event => {
      if (event.key === 'Escape') setSidebarOpen(false)
      if (event.key !== 'Tab') return
      const controls = sheet.current?.querySelectorAll('button, input, select')
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeys)
      previousFocus?.focus()
    }
  }, [sidebarOpen])

  const toggle = (arr, set, val) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const activeFilters = [
    ...selectedFlavors.map(f => ({ label: f, remove: () => toggle(selectedFlavors, setSelectedFlavors, f) })),
    ...selectedSpirits.map(s => ({ label: s, remove: () => toggle(selectedSpirits, setSelectedSpirits, s) })),
    ...selectedOccasions.map(o => ({ label: o, remove: () => toggle(selectedOccasions, setSelectedOccasions, o) })),
    ...(strength ? [{ label: strength, remove: () => setStrength('') }] : []),
    ...(level ? [{ label: level, remove: () => setLevel('') }] : []),
  ]

  const filtered = useMemo(() => {
    let result = [...cocktails]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.spirit.toLowerCase().includes(q) ||
        c.bar.toLowerCase().includes(q)
      )
    }
    if (selectedFlavors.length) result = result.filter(c => selectedFlavors.some(f => c.flavor === f || c.tags.includes(f)))
    if (selectedSpirits.length) result = result.filter(c => selectedSpirits.includes(c.spirit))
    if (sort === 'A–Z') result.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'Rating') result.sort((a, b) => b.rating - a.rating)
    return result
  }, [selectedFlavors, selectedSpirits, selectedOccasions, strength, level, sort, searchQuery])

  const renderSidebarContent = () => (
    <div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9C9589', margin: '0 0 12px' }}>Flavour</p>
      <div style={{ marginBottom: '24px' }}>
        {FLAVORS.map(f => <Checkbox key={f} label={f} checked={selectedFlavors.includes(f)} onChange={() => toggle(selectedFlavors, setSelectedFlavors, f)} />)}
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9C9589', margin: '0 0 12px' }}>Spirit</p>
      <div style={{ marginBottom: '24px' }}>
        {SPIRITS.map(s => <Checkbox key={s} label={s} checked={selectedSpirits.includes(s)} onChange={() => toggle(selectedSpirits, setSelectedSpirits, s)} />)}
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9C9589', margin: '0 0 12px' }}>Occasion</p>
      <div style={{ marginBottom: '24px' }}>
        {OCCASIONS.map(o => <Checkbox key={o} label={o} checked={selectedOccasions.includes(o)} onChange={() => toggle(selectedOccasions, setSelectedOccasions, o)} />)}
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9C9589', margin: '0 0 8px' }}>Alcohol Strength</p>
      <select value={strength} onChange={e => setStrength(e.target.value)} style={{
        width: '100%',
        backgroundColor: '#2C2A27',
        border: '1px solid rgba(240,235,225,0.1)',
        color: strength ? '#F0EBE1' : '#9C9589',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        padding: '8px 10px',
        marginBottom: '20px',
        outline: 'none',
        cursor: 'pointer',
      }}>
        <option value="">Any strength</option>
        {STRENGTHS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9C9589', margin: '0 0 8px' }}>Experience Level</p>
      <select value={level} onChange={e => setLevel(e.target.value)} style={{
        width: '100%',
        backgroundColor: '#2C2A27',
        border: '1px solid rgba(240,235,225,0.1)',
        color: level ? '#F0EBE1' : '#9C9589',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        padding: '8px 10px',
        outline: 'none',
        cursor: 'pointer',
      }}>
        <option value="">Any level</option>
        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>

      {activeFilters.length > 0 && (
        <button
          onClick={() => {
            setSelectedFlavors([])
            setSelectedSpirits([])
            setSelectedOccasions([])
            setStrength('')
            setLevel('')
          }}
          style={{
            marginTop: '24px',
            background: 'none',
            border: 'none',
            color: '#9C9589',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="explorer-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px 96px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 300,
          fontSize: '40px',
          color: '#F0EBE1',
          margin: '0 0 6px',
          fontStyle: 'italic',
        }}>Cocktail Explorer</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#9C9589', margin: 0 }}>
          {cocktails.length} cocktails across Singapore
        </p>
      </div>

      {/* Mobile filters button */}
      <div style={{ display: 'none' }} className="mobile-filter-btn">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sidebarOpen}
          style={{
            backgroundColor: '#232220',
            border: '1px solid rgba(240,235,225,0.12)',
            color: '#F0EBE1',
            padding: '10px 20px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            marginBottom: '20px',
          }}>
          ⊞ Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
        </button>
      </div>

      <div className="explorer-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '48px', alignItems: 'start' }}>
        {/* Sidebar */}
        <aside className="explorer-sidebar" style={{
          position: 'sticky',
          top: '80px',
          borderRight: '1px solid rgba(240,235,225,0.08)',
          paddingRight: '32px',
        }}>
          {renderSidebarContent()}
        </aside>

        {/* Main content */}
        <div>
          {/* Active filters + sort */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
              {activeFilters.map(f => (
                <button
                  key={f.label}
                  onClick={f.remove}
                  style={{
                    backgroundColor: 'rgba(184,134,62,0.12)',
                    border: '1px solid rgba(184,134,62,0.3)',
                    color: '#B8863E',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {f.label} <span style={{ fontSize: '13px', lineHeight: 1 }}>×</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9C9589', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sort</span>
              <select
                aria-label="Sort cocktails"
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  backgroundColor: '#232220',
                  border: '1px solid rgba(240,235,225,0.1)',
                  color: '#F0EBE1',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  padding: '6px 10px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {['Popularity', 'A–Z', 'Newest', 'Rating'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid or empty state */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '96px 0',
              borderTop: '1px solid rgba(240,235,225,0.08)',
            }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '22px', color: '#9C9589', margin: '0 0 10px' }}>No results found.</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#9C9589', margin: 0 }}>
                No cocktails match — try removing a filter.
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9C9589' }}>
                  {filtered.length} cocktail{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="explorer-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px',
              }}>
                {filtered.map(c => (
                  <CocktailCard
                    key={c.id}
                    cocktail={c}
                    onClick={() => onSelectCocktail(c)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet overlay */}
      {sidebarOpen && (
        <div
          className="filter-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26,25,24,0.85)',
            zIndex: 100,
          }}
        >
          <div
            className="filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-sheet-title"
            ref={sheet}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#232220',
              borderTop: '1px solid rgba(240,235,225,0.12)',
              padding: '32px 24px 48px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 id="filter-sheet-title" style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: '20px', color: '#F0EBE1', margin: 0 }}>Filters</h3>
              <button aria-label="Close filters" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#9C9589', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            {renderSidebarContent()}
            <button type="button" className="filter-apply-button" onClick={() => setSidebarOpen(false)}>Show {filtered.length} cocktails</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="filter-checkbox">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  )
}
