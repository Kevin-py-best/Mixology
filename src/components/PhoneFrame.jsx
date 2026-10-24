import { useEffect, useState } from 'react'

const FRAME_WIDTH = 426
const FRAME_HEIGHT = 898

export default function PhoneFrame() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const resize = () => {
      setScale(Math.max(0.1, Math.min(1, (window.innerWidth - 32) / FRAME_WIDTH, (window.innerHeight - 64) / FRAME_HEIGHT)))
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const appUrl = new URL(window.location.href)
  appUrl.searchParams.set('phone-screen', '1')

  return (
    <div className="phone-preview">
      <div className="phone-preview-device" style={{ width: FRAME_WIDTH * scale, height: FRAME_HEIGHT * scale }}>
        <div className="phone-frame" style={{ transform: `scale(${scale})` }}>
          <span className="phone-side-button phone-side-button-action" aria-hidden="true" />
          <span className="phone-side-button phone-side-button-volume" aria-hidden="true" />
          <span className="phone-side-button phone-side-button-power" aria-hidden="true" />
          <div className="phone-screen">
            <div className="phone-status-bar" aria-hidden="true">
              <span className="phone-clock">9:41</span>
              <span className="phone-dynamic-island"><span /></span>
              <div className="phone-status-icons">
                <svg viewBox="0 0 18 14"><path d="M1 10h3v4H1zm4-3h3v7H5zm4-3h3v10H9zm4-3h3v13h-3z" fill="currentColor" /></svg>
                <svg viewBox="0 0 20 16"><path d="M2 5a12 12 0 0 1 16 0M5 8a8 8 0 0 1 10 0M8 11a3 3 0 0 1 4 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><circle cx="10" cy="14" r="1.2" fill="currentColor" /></svg>
                <svg viewBox="0 0 28 14"><rect x="1" y="1" width="23" height="12" rx="3" fill="none" stroke="currentColor" strokeOpacity=".5" /><rect x="3" y="3" width="19" height="8" rx="1.5" fill="currentColor" /><path d="M26 5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
            </div>
            {/* A separate viewport keeps media queries and fixed overlays inside the phone. */}
            <iframe className="phone-app" src={appUrl.href} title="Mixology — iPhone 16 Pro" allow="autoplay" />
            <div className="phone-home-area" aria-hidden="true"><span /></div>
          </div>
        </div>
      </div>
      <p className="phone-preview-caption">iPhone 16 Pro <span>402 × 874</span></p>
    </div>
  )
}
