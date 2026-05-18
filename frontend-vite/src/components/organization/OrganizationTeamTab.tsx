import { Mail, Users, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database'

type TeamMember = Database['public']['Tables']['organization_team_members']['Row']

interface OrganizationTeamTabProps {
  teamMembers: TeamMember[]
  isLoading?: boolean
  isOwner?: boolean
  onAddMember?: () => void
}

export function OrganizationTeamTab({
  teamMembers,
  isLoading = false,
  isOwner = false,
  onAddMember,
}: OrganizationTeamTabProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-[#f5f5f5] rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (teamMembers.length === 0) {
    return (
      <Card className="border-[#f5f5f5]">
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-[#737373] mb-3" />
          <h3 className="text-lg font-medium text-[#0a0a0a] mb-1">
            {isOwner ? 'Add your first team member' : 'No Team Members Listed'}
          </h3>
          <p className="text-sm text-[#737373] mb-4">
            {isOwner
              ? 'Introduce staff or volunteers to build trust with donors.'
              : 'Team information will be added soon.'}
          </p>
          {isOwner && onAddMember && (
            <Button
              size="sm"
              onClick={onAddMember}
              className="bg-[#ea580c] hover:bg-[#dc4c06] text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Team Member
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {isOwner && onAddMember && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={onAddMember}
            className="bg-[#ea580c] hover:bg-[#dc4c06] text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Team Member
          </Button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teamMembers.map((member) => {
        const initials = member.name
          .split(' ')
          .map((word) => word[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()

        return (
          <Card key={member.id} className="border-[#f5f5f5] hover:border-[#e5e5e5] transition-colors">
            <CardContent className="p-5">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <Avatar className="h-20 w-20 mb-3">
                  {member.photo_url && (
                    <AvatarImage src={member.photo_url} alt={member.name} />
                  )}
                  <AvatarFallback className="bg-[#f5f5f5] text-[#737373] text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <h3 className="font-semibold text-[#0a0a0a]">{member.name}</h3>

                {/* Role */}
                {member.role && (
                  <p className="text-sm text-[#ea580c] font-medium">{member.role}</p>
                )}

                {/* Bio */}
                {member.bio && (
                  <p className="text-sm text-[#737373] mt-2 line-clamp-3">
                    {member.bio}
                  </p>
                )}

                {/* Email */}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-1 text-sm text-[#737373] hover:text-[#ea580c] mt-3 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Contact</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
      </div>
    </div>
  )
}
