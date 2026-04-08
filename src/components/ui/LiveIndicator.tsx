'use client'

interface LiveIndicatorProps {
  size?: 'sm' | 'md'
  className?: string
}

export default function LiveIndicator({ size = 'md', className = '' }: LiveIndicatorProps) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]'

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`relative flex ${dotSize}`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3b30] opacity-60`} />
        <span className={`relative inline-flex rounded-full ${dotSize} bg-[#ff3b30]`} />
      </span>
      <span className={`${textSize} font-bold tracking-wider text-[#ff3b30] uppercase`}>
        Live
      </span>
    </span>
  )
}
