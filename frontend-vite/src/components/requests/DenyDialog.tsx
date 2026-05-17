import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { apiConfig } from '@/config'

interface DenyDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DenyDialog({ requestId, open, onOpenChange, onSuccess }: DenyDialogProps) {
  const { getToken } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({ title: 'Reason required', description: 'Please provide a denial reason.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await api.post(
        apiConfig.endpoints.requests.deny,
        { requestId, denial_reason: reason.trim() },
        getToken
      )
      toast({ title: 'Request denied', description: 'The donor has been notified.' })
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) setReason('')
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Deny Request
          </DialogTitle>
          <DialogDescription>
            This will cancel the donation. The donor will be notified with your reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="reason">Reason for denial <span className="text-destructive">*</span></Label>
          <Textarea
            id="reason"
            placeholder="e.g. Equipment no longer needed, duplicate request, etc."
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading || !reason.trim()}>
            {loading ? 'Denying…' : 'Confirm Deny'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
