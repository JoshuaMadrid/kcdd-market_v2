/**
 * Organization Team Tab Component
 * Grid of team member cards with avatar, name, role, bio, and email
 */

import { Mail, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { OrganizationTeamMember } from '@/lib/supabase'

interface OrganizationTeamTabProps {
  members: OrganizationTeamMember[]
}

export function OrganizationTeamTab({ members }: OrganizationTeamTabProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  if (members.length === 0) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-6">Our Team</h2>
        <div className="py-12 text-center text-[#737373] bg-[#f5f5f5] rounded-lg">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No team members listed.</p>
          <p className="text-sm mt-2">This organization hasn't added team members yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-6">Our Team</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="p-6 border-[#f5f5f5] hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <Avatar className="h-20 w-20 mb-4">
                {member.photo_url && <AvatarImage src={member.photo_url} alt={member.name} />}
                <AvatarFallback className="bg-[#1b5858] text-white text-xl">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>

              {/* Name */}
              <h3 className="font-semibold text-lg text-[#0a0a0a]">{member.name}</h3>

              {/* Role */}
              {member.role && (
                <p className="text-sm text-[#ea580c] mb-3">{member.role}</p>
              )}

              {/* Bio */}
              {member.bio && (
                <p className="text-sm text-[#737373] leading-relaxed mb-4 line-clamp-3">
                  {member.bio}
                </p>
              )}

              {/* Email */}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-sm text-[#1b5858] hover:text-[#ea580c] transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
