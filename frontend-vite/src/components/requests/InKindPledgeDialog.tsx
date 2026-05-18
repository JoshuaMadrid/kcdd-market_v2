import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Package } from 'lucide-react'
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
import { api } from '@/lib/api'
import type { DeviceTypeBreakdown } from '@/types/database'

const NOTES_MAX = 500

interface InKindPledgeDialogProps {
  request: { id: string; device_type_breakdown?: DeviceTypeBreakdown | null }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type DeviceKey = 'desktops' | 'laptops' | 'tablets' | 'smartphones'
const DEVICE_KEYS: DeviceKey[] = ['desktops', 'laptops', 'tablets', 'smartphones']

export function InKindPledgeDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
}: InKindPledgeDialogProps) {
  const { getToken } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState<Record<DeviceKey, string>>({
    desktops: '',
    laptops: '',
    tablets: '',
    smartphones: '',
  })
  const [donorNotes, setDonorNotes] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ counts?: string; address?: string }>({})

  // Pre-populate device defaults from request.device_type_breakdown when dialog opens
  useEffect(() => {
    if (open) {
      const b = request.device_type_breakdown ?? {}
      setCounts({
        desktops: b.desktops ? String(b.desktops) : '',
        laptops: b.laptops ? String(b.laptops) : '',
        tablets: b.tablets ? String(b.tablets) : '',
        smartphones: b.smartphones ? String(b.smartphones) : '',
      })
      setDonorNotes('')
      setDeliveryAddress('')
      setFieldErrors({})
    }
  }, [open, request.device_type_breakdown])

  const totalDevices = DEVICE_KEYS.reduce(
    (sum, k) => sum + (parseInt(counts[k]) || 0),
    0
  )

  const handleSubmit = async () => {
    const errors: typeof fieldErrors = {}
    if (totalDevices <= 0) errors.counts = 'Pledge at least one device.'
    if (!deliveryAddress.trim()) errors.address = 'Delivery address is required.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      const device_breakdown = DEVICE_KEYS.reduce<DeviceTypeBreakdown>((acc, k) => {
        const n = parseInt(counts[k]) || 0
        if (n > 0) acc[k] = n
        return acc
      }, {})

      await api.post(
        '/api/requests/pledge-in-kind',
        {
          requestId: request.id,
          device_breakdown,
          donor_notes: donorNotes.trim() || undefined,
          delivery_address: deliveryAddress.trim(),
        },
        getToken
      )
      toast({ title: 'Pledge submitted', description: 'The organization will review your pledge shortly.' })
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      const message = err?.message || ''
      if (message.includes('no longer available') || err?.status === 409) {
        toast({
          title: 'Request unavailable',
          description: 'This request is no longer available for pledges.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Error', description: message || 'Failed to submit pledge', variant: 'destructive' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value && !loading) onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#ea580c]" />
            Donate Devices
          </DialogTitle>
          <DialogDescription>
            Pledge surplus equipment instead of cash. The organization will confirm receipt after delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>How many devices can you pledge?</Label>
            <div className="grid grid-cols-2 gap-3">
              {DEVICE_KEYS.map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`pledge-${key}`} className="font-normal capitalize text-xs">
                    {key}
                  </Label>
                  <Input
                    id={`pledge-${key}`}
                    type="number"
                    min="0"
                    value={counts[key]}
                    onChange={(e) => setCounts((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            {fieldErrors.counts && (
              <p className="text-xs text-destructive">{fieldErrors.counts}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pledge-notes">Notes (optional)</Label>
            <Textarea
              id="pledge-notes"
              rows={3}
              maxLength={NOTES_MAX}
              value={donorNotes}
              onChange={(e) => setDonorNotes(e.target.value)}
              placeholder="Condition, accessories, age, OS, anything the recipient should know"
            />
            <p className="text-xs text-muted-foreground text-right">
              {donorNotes.length} / {NOTES_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pledge-address">Pickup or shipping address</Label>
            <Textarea
              id="pledge-address"
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Street, city, state, ZIP"
            />
            {fieldErrors.address && (
              <p className="text-xs text-destructive">{fieldErrors.address}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Pledge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
