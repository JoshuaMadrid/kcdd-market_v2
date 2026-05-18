import { useState } from 'react'
import { Newspaper } from 'lucide-react'
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
import { createOrganizationUpdate } from '@/lib/supabase'
import type { Database } from '@/types/database'

type OrganizationUpdate = Database['public']['Tables']['organization_updates']['Row']

interface PostUpdateDialogProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (update: OrganizationUpdate) => void
}

const TITLE_MAX = 120
const CONTENT_MAX = 1000

export function PostUpdateDialog({
  organizationId,
  open,
  onOpenChange,
  onSuccess,
}: PostUpdateDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !loading

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const created = await createOrganizationUpdate({
        organization_id: organizationId,
        title: title.trim(),
        content: content.trim(),
        is_published: true,
      })
      toast({ title: 'Update posted', description: 'Your update is now visible on your profile.' })
      onOpenChange(false)
      onSuccess(created as OrganizationUpdate)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setTitle('')
      setContent('')
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#ea580c]" />
            Post Update
          </DialogTitle>
          <DialogDescription>
            Share news, milestones, or progress with donors and visitors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="update-title">Title</Label>
            <Input
              id="update-title"
              placeholder="e.g. New laptops delivered to 12 students"
              maxLength={TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length} / {TITLE_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-content">Content</Label>
            <Textarea
              id="update-content"
              placeholder="Describe what happened, who it helped, or what's next…"
              rows={5}
              maxLength={CONTENT_MAX}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length} / {CONTENT_MAX}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? 'Posting…' : 'Post Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
