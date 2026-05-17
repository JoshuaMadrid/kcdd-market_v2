import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { CheckCircle } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { apiConfig } from '@/config'

interface FulfillDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function FulfillDialog({ requestId, open, onOpenChange, onSuccess }: FulfillDialogProps) {
  const { getToken } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fulfillmentMethod, setFulfillmentMethod] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post(
        apiConfig.endpoints.requests.fulfill,
        {
          requestId,
          fulfillment_method: fulfillmentMethod || undefined,
          tracking_number: trackingNumber || undefined,
          notes: notes || undefined,
        },
        getToken
      )
      toast({ title: 'Request marked as fulfilled', description: 'The donor has been notified.' })
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setFulfillmentMethod('')
      setTrackingNumber('')
      setNotes('')
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Mark as Fulfilled
          </DialogTitle>
          <DialogDescription>
            Confirm that this donation has been delivered or processed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Fulfillment Method (optional)</Label>
            <Select value={fulfillmentMethod} onValueChange={setFulfillmentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="How was it delivered?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="pickup">In-person pickup</SelectItem>
                <SelectItem value="digital">Digital transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking Number (optional)</Label>
            <Input
              id="tracking"
              placeholder="e.g. 1Z999AA10123456784"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details for your records..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Confirm Fulfilled'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
