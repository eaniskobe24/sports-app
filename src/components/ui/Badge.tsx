import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'live' | 'upcoming' | 'final' | 'playoff' | 'sport'
  color?: string
  className?: string
}

const variants: Record<string, string> = {
  default: 'bg-[#2c2c2e] text-[#8e8e93]',
  live: 'bg-[#ff3b30]/15 text-[#ff3b30]',
  upcoming: 'bg-[#3a3a3c] text-[#8e8e93]',
  final: 'bg-[#2c2c2e] text-[#636366]',
  playoff: 'bg-[#bf5af2]/15 text-[#bf5af2]',
  sport: 'bg-[#1c1c1e] text-[#8e8e93] border border-[#38383a]',
}

export default function Badge({ children, variant = 'default', color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase',
        variants[variant],
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </span>
  )
}
