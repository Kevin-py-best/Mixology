import { useState } from 'react'

export default function Navbar({ currentPage, onNavigate, onSearch }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(query)
    onNavigate('explorer')
    setSearchOpen(false)
    setQuery('')
  }

  const navLink = (label, page) => (
    <button
      onClick={() => onNavigate(page)}
      style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: currentPage === page ? '#B8863E' : '#9C9589',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 0',
        borderBottom: currentPage === page ? '1px solid #B8863E' : '1px solid transparent',
        transition: 'color 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => { if (currentPage !== page) e.target.style.color = '#F0EBE1' }}
      onMouseLeave={e => { if (currentPage !== page) e.target.style.color = '#9C9589' }}
    >
      {label}
    </button>
  )

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#1A1918',
      borderBottom: '1px solid rgba(240,235,225,0.08)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '22px',
            fontWeight: 300,
            letterSpacing: '0.04em',
            color: '#F0EBE1',
            fontStyle: 'italic',
          }}>
            Mixology
          </span>
        </button>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
          {navLink('Home', 'home')}
          {navLink('Cocktails', 'explorer')}
          {navLink('Bars', 'bars')}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search cocktails or bars…"
                style={{
                  backgroundColor: '#232220',
                  border: '1px solid rgba(240,235,225,0.14)',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  color: '#F0EBE1',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  outline: 'none',
                  width: '220px',
                }}
              />
              <button type="submit" style={{
                background: '#B8863E',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 14px',
                color: '#2E1F0C',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                textTransform: 'uppercase',
              }}>Go</button>
              <button type="button" onClick={() => setSearchOpen(false)} style={{
                background: 'none',
                border: 'none',
                color: '#9C9589',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
              }}>×</button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9C9589',
                transition: 'color 0.2s',
                padding: '4px',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F0EBE1')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9C9589')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
