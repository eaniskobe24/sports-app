'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Radio, Star, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/live', label: 'Live', Icon: Radio },
  { href: '/highlights', label: 'Top Plays', Icon: Star },
  { href: '/profile', label: 'Profile', Icon: User },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[428px] z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="glass-heavy border-t border-[#38383a]/60 px-2 pt-2 pb-1">
        <nav className="flex items-center justify-around">
          {tabs.map(({ href, label, Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-150 active:scale-95"
              >
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={cn(
                      'transition-colors duration-150',
                      isActive ? 'text-[#0a84ff]' : 'text-[#8e8e93]'
                    )}
                  />
                  {href === '/live' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff3b30] rounded-full border border-black" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium tracking-wide transition-colors duration-150',
                    isActive ? 'text-[#0a84ff]' : 'text-[#8e8e93]'
                  )}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
