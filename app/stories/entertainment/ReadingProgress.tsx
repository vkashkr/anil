'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 h-1 z-50 transition-all duration-100 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  )
}
