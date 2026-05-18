import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Package, CheckCircle, XCircle } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { fetchInKindPledgeForRequest } from '@/lib/supabase'
import type { InKindPledge } from '@/types/database'

interface AcceptPledgeDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AcceptPledgeDialog({
  requestId,
  open,
  onOpenChange,
  onSuccess,
}: AcceptPledgeDialogProps) {
  const { getToken } = useAuth()
  const { toast } = useToast()
  const [pledge, setPledge] = useState<InKindPledge | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchInKindPledgeForRequest(requestId)
      .then(setPledge)
      .catch(() => setPledge(null))
      .finally(() => setLoading(false))
  }, [open, requestId])

  const handleAccept = async () => {
    setSubmitting(true)
    try {
      await api.post('/api/requests/accept-pledge', { requestId }, getToken)
      toast({ title: 'Pledge accepted', description: 'The donor will be notified to arrange delivery.' })
      handleClose()
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    setSubmitting(true)
    try {
      await api.post(
        '/api/requests/reject-pledge',
        { requestId, reason: rejectReason.trim() || undefined },
        getToken
      )
      toast({ title: 'Pledge declined', description: 'The request is open again.' })
      handleClose()
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setPledge(null)
    setShowRejectInput(false)
    setRejectReason('')
    onOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value && !submitting) handleClose()
  }

  const deviceRows = pledge
    ? (
        [
          ['Desktops', pledge.device_breakdown.desktops],
          ['Laptops', pledge.device_breakdown.laptops],
          ['Tablets', pledge.device_breakdown.tablets],
          ['Smartphones', pledge.device_breakdown.smartphones],
        ] as Array<[string, number | undefined]>
      ).filter(([, n]) => (n ?? 0) > 0)
    : []

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#ea580c]" />
            Review Device Pledge
          </DialogTitle>
          <DialogDescription>
            Review what the donor is offering and decide whether to accept.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !pledge ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No pledge found for this request.
            </p>
          ) : (
            <>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  DEVICES OFFERED
                </Label>
                <table className="w-full text-sm mt-1">
                  <tbody>
                    {deviceRows.map(([label, n]) => (
                      <tr key={label} className="border-b last:border-b-0">
                        <td className="py-1.5 text-muted-foreground">{label}</td>
                        <td className="py-1.5 text-right font-medium">{n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pledge.donor_notes && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    DONOR NOTES
                  </Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{pledge.donor_notes}</p>
                </div>
              )}

              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  DELIVERY ADDRESS
                </Label>
                <p className="text-sm font-mono bg-muted rounded-md p-2 mt-1 whitespace-pre-wrap">
                  {pledge.delivery_address}
                </p>
              </div>

              {showRejectInput && (
                <div className="space-y-2">
                  <Label htmlFor="reject-reason">Reason (optional)</Label>
                  <Textarea
                    id="reject-reason"
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Briefly explain why this pledge doesn't fit the request."
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {!showRejectInput ? (
            <>
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1"
                onClick={() => setShowRejectInput(true)}
                disabled={loading || !pledge || submitting}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleAccept} disabled={loading || !pledge || submitting} className="gap-1">
                <CheckCircle className="h-4 w-4" />
                {submitting ? 'Working…' : 'Accept Pledge'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowRejectInput(false)} disabled={submitting}>
                Back
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={submitting}>
                {submitting ? 'Working…' : 'Confirm Rejection'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
