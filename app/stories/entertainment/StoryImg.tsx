'use client'

// Fix #12 — next/image instead of raw <img>
import Image from 'next/image'

interface StoryImgProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

export default function StoryImg({ src, alt, className, loading = 'lazy' }: StoryImgProps) {
  return (
    // fill requires parent to have position: relative/absolute/fixed (all call-sites satisfy this)
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      loading={loading}
      sizes="100vw"
      unoptimized
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
