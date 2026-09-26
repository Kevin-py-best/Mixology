import { useCallback, useEffect, useState } from "react"
import { getCocktailBySlug } from "../services/cocktails"

export default function useCocktailDetail(slug) {
  const [requestVersion, setRequestVersion] = useState(0)
  const [state, setState] = useState({
    cocktail: null,
    error: null,
    status: "loading",
  })

  const retry = useCallback(() => {
    setRequestVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!slug) {
      setState({ cocktail: null, error: null, status: "not-found" })
      return () => {
        cancelled = true
      }
    }

    setState({ cocktail: null, error: null, status: "loading" })

    getCocktailBySlug(slug)
      .then((cocktail) => {
        if (cancelled) return

        setState({
          cocktail,
          error: null,
          status: cocktail ? "success" : "not-found",
        })
      })
      .catch((error) => {
        if (cancelled) return
        console.error("Unable to load cocktail detail.", error)
        setState({ cocktail: null, error, status: "error" })
      })

    return () => {
      cancelled = true
    }
  }, [requestVersion, slug])

  return {
    ...state,
    retry,
  }
}
