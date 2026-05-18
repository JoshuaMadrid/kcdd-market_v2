import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createOrganizationTeamMember } from '@/lib/supabase'
import type { Database } from '@/types/database'

type TeamMember = Database['public']['Tables']['organization_team_members']['Row']

interface AddTeamMemberDialogProps {
  organizationId: string
  currentCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (member: TeamMember) => void
}

const BIO_MAX = 300

export function AddTeamMemberDialog({
  organizationId,
  currentCount,
  open,
  onOpenChange,
  onSuccess,
}: AddTeamMemberDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')

  const canSubmit = name.trim().length > 0 && !loading

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const created = await createOrganizationTeamMember({
        organization_id: organizationId,
        name: name.trim(),
        role: role.trim() || null,
        bio: bio.trim() || null,
        email: email.trim() || null,
        is_active: true,
        display_order: currentCount,
      })
      toast({ title: 'Team member added', description: `${name.trim()} is now on your team.` })
      onOpenChange(false)
      onSuccess(created as TeamMember)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setName('')
      setRole('')
      setBio('')
      setEmail('')
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#ea580c]" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Introduce a staff member or volunteer to visitors of your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-role">Role (optional)</Label>
            <Input
              id="member-role"
              placeholder="Executive Director"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-bio">Bio (optional)</Label>
            <Textarea
              id="member-bio"
              placeholder="A short introduction…"
              rows={3}
              maxLength={BIO_MAX}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length} / {BIO_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-email">Email (optional)</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="jane@example.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? 'Adding…' : 'Add Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
