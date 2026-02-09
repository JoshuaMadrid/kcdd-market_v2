/**
 * Organization Logo Component
 * Displays organization avatar with logo_url or emoji fallback
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface OrganizationLogoProps {
  logoUrl?: string | null
  logoEmoji?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-16 w-16 text-2xl',
  xl: 'h-24 w-24 text-4xl'
}

export function OrganizationLogo({
  logoUrl,
  logoEmoji,
  name,
  size = 'md',
  className
}: OrganizationLogoProps) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {logoUrl && <AvatarImage src={logoUrl} alt={name} />}
      <AvatarFallback className="bg-[#f5f5f5] text-[#0a0a0a]">
        {logoEmoji || initials}
      </AvatarFallback>
    </Avatar>
  )
}
