'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Settings, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSpoiler } from '@/contexts/SpoilerContext'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showSettings?: boolean
  showSpoilerToggle?: boolean
  transparent?: boolean
  rightElement?: React.ReactNode
  className?: string
}

export default function Header({
  title,
  showBack = false,
  showSettings = false,
  showSpoilerToggle = false,
  transparent = false,
  rightElement,
  className,
}: HeaderProps) {
  const router = useRouter()
  const { spoilerShield, toggleSpoilerShield } = useSpoiler()

  return (
    <div
      className={cn(
        'sticky top-0 z-40',
        !transparent && 'glass',
        className
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 h-14">
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
        <div className="w-auto flex items-center justify-end gap-2">
          {/* Spoiler shield toggle — shown on home page */}
          {showSpoilerToggle && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={toggleSpoilerShield}
              className="flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200"
              style={{
                backgroundColor: spoilerShield
                  ? 'rgba(10,132,255,0.18)'
                  : 'rgba(255,255,255,0.06)',
                border: spoilerShield
                  ? '1px solid rgba(10,132,255,0.35)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
              title={spoilerShield ? 'Spoiler Shield ON — tap to disable' : 'Enable Spoiler Shield'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {spoilerShield ? (
                  <motion.span key="off"
                    initial={{ rotate: -20, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate:  20,  opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <EyeOff size={14} className="text-[#0a84ff]" />
                  </motion.span>
                ) : (
                  <motion.span key="on"
                    initial={{ rotate: 20,  opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate: -20,  opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Eye size={14} className="text-[#636366]" />
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {spoilerShield && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{   width: 0, opacity: 0 }}
                    className="text-[10px] font-bold text-[#0a84ff] overflow-hidden whitespace-nowrap"
                  >
                    Shield
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {rightElement}

          {showSettings && !rightElement && (
            <button
              className="text-[#636366] active:opacity-50 transition-opacity"
              onClick={() => router.push('/profile')}
            >
              <Settings size={19} strokeWidth={1.6} />
            </button>
          )}
        </div>
      </div>

      {/* Apple Pro–style iridescent accent line */}
      {!transparent && <div className="header-accent-line" />}
    </div>
  )
}
