import { useCallback, useEffect, useState } from 'react'

export default function useLiveData(loader, id = null) {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState({ data: [], status: 'loading' })
  const retry = useCallback(() => setVersion(value => value + 1), [])
  useEffect(() => {
    let cancelled = false
    setState({ data: [], status: 'loading' })
    loader(id).then(data => {
      if (!cancelled) setState({ data, status: 'success' })
    }).catch(() => {
      if (!cancelled) setState({ data: [], status: 'error' })
    })
    return () => { cancelled = true }
  }, [loader, id, version])
  return { ...state, retry }
}
