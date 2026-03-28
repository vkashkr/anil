'use client'

interface StoryImgProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

export default function StoryImg({ src, alt, className, loading = 'lazy' }: StoryImgProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
