import { useState } from "react"

export default function CocktailCard({ cocktail, featured, compact = false, rank, badge, onClick }) {
  const [hovered, setHovered] = useState(false)
  const imageUrl = cocktail.img.includes("images.unsplash.com")
    ? `${cocktail.img}${
        cocktail.img.includes("?") ? "&" : "?"
      }w=480&h=360&fit=crop&auto=format`
    : cocktail.img

  const handleKeyDown = (event) => {
    if (!onClick) return

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()

      onClick()
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        backgroundColor: hovered ? '#2C2A27' : '#232220',
        border: hovered
          ? '1px solid rgba(184,134,62,0.38)'
          : featured
            ? '1px solid rgba(201,184,150,0.3)'
            : '1px solid rgba(240,235,225,0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 14px 30px rgba(0,0,0,0.18)' : 'none',
        transition: 'background-color 0.2s, border-color 0.2s, transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: compact ? '16/9' : '4/3', overflow: 'hidden', backgroundColor: '#2C2A27' }}>
        <img
          src={`${cocktail.img}?w=480&h=360&fit=crop&auto=format`}
          alt={cocktail.name}
          style={{
            width: "100%",

            height: "100%",

            objectFit: "cover",

            transform: hovered ? "scale(1.03)" : "scale(1)",

            transition: "transform 0.4s ease",
          }}
        />
        {rank && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            minWidth: '27px',
            height: '27px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(26,25,24,0.88)',
            border: '1px solid rgba(201,184,150,0.42)',
            color: '#C9B896',
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}>
            {String(rank).padStart(2, '0')}
          </div>
        )}
        {badge && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: '#C9B896',
            color: '#3D2E14',
            border: '1px solid rgba(61,46,20,0.12)',
            padding: '6px 9px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {badge}
          </div>
        )}
        {featured && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#C9B896',
            color: '#3D2E14',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '4px 8px',
            fontFamily: 'Inter, sans-serif',
          }}>
            Featured
          </div>
        )}
      </div>
      <div style={{ padding: compact ? '13px 14px 14px' : '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <h3 style={{
            fontFamily: 'Fraunces, serif',
            fontSize: compact ? '16px' : '18px',
            fontWeight: 300,
            color: '#F0EBE1',
            lineHeight: 1.2,
            margin: 0,
          }}>
            {cocktail.name}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              flexShrink: 0,
              marginLeft: "8px",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="#B8863E">
              <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" />
            </svg>
            <span
              style={{
                fontSize: "12px",
                color: "#B8863E",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {cocktail.rating}
            </span>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#9C9589', margin: compact ? '0 0 8px' : '0 0 10px', fontFamily: 'Inter, sans-serif' }}>
          {cocktail.spirit} · {cocktail.bar}
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {cocktail.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "10px",

                color: "#9C9589",

                border: "1px solid rgba(156,149,137,0.3)",

                padding: "2px 8px",

                letterSpacing: "0.06em",

                textTransform: "uppercase",

                fontFamily: "Inter, sans-serif",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
