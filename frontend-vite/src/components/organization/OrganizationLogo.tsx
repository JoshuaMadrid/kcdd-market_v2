import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface OrganizationLogoProps {
  name: string
  logoUrl?: string | null
  logoEmoji?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-16 w-16 text-2xl',
  xl: 'h-24 w-24 text-4xl',
}

export function OrganizationLogo({
  name,
  logoUrl,
  logoEmoji,
  size = 'md',
  className,
}: OrganizationLogoProps) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {logoUrl && <AvatarImage src={logoUrl} alt={name} />}
      <AvatarFallback className="bg-[#f5f5f5] text-[#737373]">
        {logoEmoji || initials}
      </AvatarFallback>
    </Avatar>
  )
}
