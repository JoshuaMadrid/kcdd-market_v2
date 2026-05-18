import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { PackageCheck } from 'lucide-react'
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

const NOTES_MAX = 500

interface ConfirmReceiptDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ConfirmReceiptDialog({
  requestId,
  open,
  onOpenChange,
  onSuccess,
}: ConfirmReceiptDialogProps) {
  const { getToken } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post(
        '/api/requests/confirm-in-kind-receipt',
        { requestId, notes: notes.trim() || undefined },
        getToken
      )
      toast({ title: 'Receipt confirmed', description: 'Request has been marked as fulfilled.' })
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) setNotes('')
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-green-600" />
            Confirm Device Receipt
          </DialogTitle>
          <DialogDescription>
            Confirm the pledged devices have physically arrived. This marks the request as fulfilled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="receipt-notes">Notes (optional)</Label>
          <Textarea
            id="receipt-notes"
            rows={3}
            maxLength={NOTES_MAX}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Condition on arrival, any discrepancies, packing slip number…"
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length} / {NOTES_MAX}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Confirm Receipt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
