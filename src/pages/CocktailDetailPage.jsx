import { useEffect, useMemo, useState } from "react"
import useCocktailDetail from "../hooks/useCocktailDetail"
import { getCocktailDetails } from "../data/cocktailDetails"

const STRENGTH_LEVELS = {
  Light: 1,
  Medium: 3,
  Strong: 4,
}

function createLegacyCocktail(cocktail) {
  if (!cocktail) return null

  const details = getCocktailDetails(cocktail.id)
  const strengthName = details.strength.split(" · ")[0]
  const level = STRENGTH_LEVELS[strengthName] || 3

  return {
    id: cocktail.id,
    slug: cocktail.slug,
    name: cocktail.name,
    shortDescription: details.tasteDescription,
    image: {
      url: cocktail.img,
      alt: `${cocktail.name} cocktail`,
    },
    taste: {
      title: details.tasteTitle,
      description: details.tasteDescription,
      tags: cocktail.tags || [],
      notes: details.tastingNotes || [],
    },
    alcoholStrength: {
      level,
      label: strengthName,
      description: details.strength,
    },
    ingredients: [],
    history: details.history,
    readAloud: details.readAloud || details.history,
    occasions: details.occasion ? [details.occasion] : [],
    servingBars: [],
    source: null,
  }
}

function formatAmount(ingredient) {
  if (ingredient.amount == null) {
    return ingredient.isGarnish ? "Garnish" : "To taste"
  }

  const numericAmount = Number(ingredient.amount)
  const amount = Number.isNaN(numericAmount)
    ? ingredient.amount
    : numericAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })

  return [amount, ingredient.unit].filter(Boolean).join(" ")
}

function DetailStatus({ title, message, onBack, onRetry }) {
  return (
    <div className="cocktail-detail-page">
      <div className="cocktail-detail-shell">
        <section
          className="cocktail-status-card"
          role={onRetry ? "alert" : "status"}
        >
          <p className="cocktail-eyebrow">Cocktail profile</p>
          <h1>{title}</h1>
          <p>{message}</p>
          <div className="cocktail-status-actions">
            {onRetry && (
              <button
                type="button"
                className="outline-action"
                onClick={onRetry}
              >
                Try again
              </button>
            )}
            <button
              type="button"
              className="cocktail-back-button"
              onClick={onBack}
            >
              ← Back to cocktails
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function CocktailDetailPage({
  slug,
  cocktail: fallbackCocktail,
  onBack,
}) {
  const { cocktail, error, retry, status } = useCocktailDetail(slug)
  const legacyCocktail = useMemo(
    () => createLegacyCocktail(fallbackCocktail),
    [fallbackCocktail],
  )
  const resolvedCocktail =
    cocktail || (status === "not-found" ? legacyCocktail : null)
  const [imageFailed, setImageFailed] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [speechNotice, setSpeechNotice] = useState("")

  useEffect(() => {
    setImageFailed(false)
  }, [resolvedCocktail?.image.url])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (status === "loading") {
    return (
      <DetailStatus
        title="Loading cocktail…"
        message="Gathering the taste, ingredients, and story behind this drink."
        onBack={onBack}
      />
    )
  }

  if (status === "error") {
    return (
      <DetailStatus
        title="Something went wrong."
        message={
          error?.message === "Supabase configuration is missing."
            ? "The cocktail data connection has not been configured."
            : "We could not load this cocktail right now."
        }
        onBack={onBack}
        onRetry={retry}
      />
    )
  }

  if (!resolvedCocktail) {
    return (
      <DetailStatus
        title="Cocktail not found"
        message="This cocktail may not be published yet."
        onBack={onBack}
      />
    )
  }

  const toggleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechNotice("Read aloud is not supported in this browser.")
      return
    }

    if (isReading) {
      window.speechSynthesis.cancel()
      setIsReading(false)
      setSpeechNotice("")
      return
    }

    const utterance = new SpeechSynthesisUtterance(
      resolvedCocktail.readAloud || resolvedCocktail.history,
    )
    utterance.rate = 0.94
    utterance.pitch = 0.96
    utterance.onend = () => setIsReading(false)
    utterance.onerror = () => {
      setIsReading(false)
      setSpeechNotice("The story could not be read aloud right now.")
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeechNotice("")
    setIsReading(true)
  }

  return (
    <div className="cocktail-detail-page">
      <div className="cocktail-detail-shell">
        <div className="cocktail-detail-back-row">
          <button
            type="button"
            className="cocktail-back-button"
            onClick={onBack}
          >
            ← Back to cocktails
          </button>
          <span className="cocktail-detail-kicker">
            {cocktail ? "Live cocktail profile" : "Preview cocktail profile"}
          </span>
        </div>

        <section className="cocktail-detail-hero">
          <div>
            <figure className="cocktail-detail-image">
              {!imageFailed ? (
                <img
                  src={resolvedCocktail.image.url}
                  alt={resolvedCocktail.image.alt}
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div
                  className="cocktail-image-fallback"
                  role="img"
                  aria-label={resolvedCocktail.image.alt}
                >
                  <span>Image unavailable</span>
                  <strong>{resolvedCocktail.name}</strong>
                </div>
              )}
            </figure>

            <section className="cocktail-taste-card">
              <p className="cocktail-eyebrow">How it tastes</p>
              <h2>{resolvedCocktail.taste.title}</h2>
              <p className="cocktail-muted-copy">
                {resolvedCocktail.taste.description}
              </p>
              <div className="cocktail-note-list">
                {resolvedCocktail.taste.notes.map((note) => (
                  <span key={note}>{note}</span>
                ))}
              </div>
              <div className="cocktail-taste-tags" aria-label="Taste tags">
                {resolvedCocktail.taste.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </section>
          </div>

          <div className="cocktail-detail-info-column">
            <section className="cocktail-identity-card">
              <p className="cocktail-eyebrow">The serve</p>
              <h1>{resolvedCocktail.name}</h1>
              <div className="cocktail-origin-divider" />
              <p className="cocktail-detail-summary">
                {resolvedCocktail.shortDescription}
              </p>
            </section>

            <section className="cocktail-facts-card">
              <p className="cocktail-eyebrow">Alcohol strength</p>
              <div className="cocktail-strength-heading">
                <strong>{resolvedCocktail.alcoholStrength.level} of 5</strong>
                <span>{resolvedCocktail.alcoholStrength.label}</span>
              </div>
              <div
                className="cocktail-strength-meter"
                aria-label={`${resolvedCocktail.alcoholStrength.level} out of 5, ${resolvedCocktail.alcoholStrength.label}`}
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <span
                    key={level}
                    className={
                      level <= resolvedCocktail.alcoholStrength.level
                        ? "is-filled"
                        : ""
                    }
                  />
                ))}
              </div>
              <p className="cocktail-muted-copy">
                {resolvedCocktail.alcoholStrength.description}
              </p>

              <div className="cocktail-fact-divider" />
              <p className="cocktail-fact-label">Best occasions</p>
              <div className="cocktail-occasion-list">
                {resolvedCocktail.occasions.map((occasion) => (
                  <span key={occasion}>{occasion}</span>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="cocktail-ingredients-section">
          <div className="detail-section-heading">
            <div>
              <p className="cocktail-eyebrow">Inside the glass</p>
              <h2>Ingredients</h2>
            </div>
          </div>

          {resolvedCocktail.ingredients.length > 0 ? (
            <div className="cocktail-ingredient-list">
              {resolvedCocktail.ingredients.map((ingredient) => (
                <div className="cocktail-ingredient-row" key={ingredient.id}>
                  <span className="cocktail-ingredient-amount">
                    {formatAmount(ingredient)}
                  </span>
                  <div>
                    <strong>{ingredient.name}</strong>
                    {ingredient.preparationNote && (
                      <small>{ingredient.preparationNote}</small>
                    )}
                  </div>
                  <span className="cocktail-ingredient-kind">
                    {ingredient.isGarnish
                      ? "Garnish"
                      : ingredient.isOptional
                        ? "Optional"
                        : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="cocktail-empty-copy">
              The ingredient list for this preview cocktail is being added.
            </p>
          )}
        </section>

        <section className="serving-bars-section">
          <div className="detail-section-heading">
            <div>
              <p className="cocktail-eyebrow">Follow the drink</p>
              <h2>Where to drink it</h2>
            </div>
          </div>
          <div className="serving-bars-empty">
            <p>Verified Singapore bar availability is being added.</p>
            <span>
              We will only show venues after the cocktail and current menu
              availability have been confirmed.
            </span>
          </div>
        </section>

        <section className="cocktail-history-card">
          <div className="history-card-heading">
            <div>
              <p className="cocktail-eyebrow">The story behind the glass</p>
              <h2>A short history of the {resolvedCocktail.name}</h2>
            </div>
            <span className="history-card-mark">01</span>
          </div>
          <p className="cocktail-history-copy">{resolvedCocktail.history}</p>
          <div className="history-read-row">
            <button
              type="button"
              className="read-aloud-button"
              onClick={toggleReadAloud}
            >
              <span aria-hidden="true">{isReading ? "Ⅱ" : "◖"}</span>
              {isReading ? "Stop reading" : "Read it out"}
            </button>
            <span className="speech-status" role="status" aria-live="polite">
              {speechNotice ||
                (isReading
                  ? "Reading the story aloud…"
                  : "Listen while you browse.")}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
