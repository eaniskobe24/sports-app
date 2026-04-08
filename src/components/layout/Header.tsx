'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showSettings?: boolean
  transparent?: boolean
  rightElement?: React.ReactNode
  className?: string
}

export default function Header({
  title,
  showBack = false,
  showSettings = false,
  transparent = false,
  rightElement,
  className,
}: HeaderProps) {
  const router = useRouter()

  return (
    <div
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between px-4 h-14',
        !transparent && 'glass border-b border-[#38383a]/40',
        className
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Left */}
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-0.5 text-[#0a84ff] active:opacity-50 transition-opacity"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Center */}
      <div className="flex-1 text-center">
        {title && (
          <h1 className="text-[16px] font-semibold tracking-tight text-white truncate">
            {title}
          </h1>
        )}
        {!title && !showBack && (
          <span className="text-[18px] font-bold tracking-tight gradient-text">
            GameCast
          </span>
        )}
      </div>

      {/* Right */}
      <div className="w-10 flex justify-end">
        {rightElement}
        {showSettings && !rightElement && (
          <button
            className="text-[#8e8e93] active:opacity-50 transition-opacity"
            onClick={() => router.push('/profile')}
          >
            <Settings size={20} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  )
}
