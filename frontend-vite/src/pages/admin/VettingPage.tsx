import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { fetchAllOrganizations, updateOrganizationVetting } from '@/lib/supabase'

export function AdminVettingPage() {
  const { toast } = useToast()
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [target, setTarget] = useState<any>(null)
  const [targetAction, setTargetAction] = useState<'approve' | 'reject' | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchAllOrganizations()
      setOrgs(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openDialog = (org: any, action: 'approve' | 'reject') => {
    setTarget(org)
    setTargetAction(action)
    setNote(org.vetting_note ?? '')
  }

  const closeDialog = () => {
    setTarget(null)
    setTargetAction(null)
    setNote('')
  }

  const handleSave = async () => {
    if (!target || !targetAction) return
    setSaving(true)
    try {
      await updateOrganizationVetting(target.id, targetAction === 'approve', note)
      toast({
        title: targetAction === 'approve' ? 'Organization approved' : 'Organization rejected',
        description: target.name,
      })
      closeDialog()
      load()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Organization Vetting</h1>
        <p className="text-muted-foreground mt-2">
          {loading ? '' : `${orgs.length} organizations · ${orgs.filter((o) => o.is_vetted).length} vetted`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 flex gap-4">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building2 className="h-10 w-10 mx-auto mb-3" />
            No organizations found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orgs.map((org) => (
            <Card key={org.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{org.name}</CardTitle>
                    <CardDescription className="mt-0.5">{org.organization_type}</CardDescription>
                  </div>
                  <Badge variant={org.is_vetted ? 'default' : 'secondary'}>
                    {org.is_vetted ? 'Vetted' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{org.mission}</p>
                {org.vetting_note && (
                  <p className="text-xs text-muted-foreground italic mb-3">
                    Note: {org.vetting_note}
                  </p>
                )}
                {org.ages_served && org.ages_served.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-1">
                    Ages Served: {org.ages_served.join(', ')}
                  </p>
                )}
                {org.pre_eligibility_status && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Pre-Eligibility: {org.pre_eligibility_status}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-700 border-green-300 hover:bg-green-50 gap-1"
                    onClick={() => openDialog(org, 'approve')}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {org.is_vetted ? 'Re-approve' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1"
                    onClick={() => openDialog(org, 'reject')}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!target} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {targetAction === 'approve' ? 'Approve' : 'Reject'} — {target?.name}
            </DialogTitle>
            <DialogDescription>
              {targetAction === 'approve'
                ? 'This organization will be able to receive donations.'
                : 'This organization will be marked as not vetted.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="vetting-note">Vetting note (optional)</Label>
            <Textarea
              id="vetting-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note about this decision…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button
              variant={targetAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : `Confirm ${targetAction === 'approve' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
