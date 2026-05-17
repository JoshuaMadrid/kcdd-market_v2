import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase, createRequestWithCategories } from '@/lib/supabase'
import { useCBOOrganization } from '@/hooks/useCBOOrganization'
import { routes } from '@/config'

export function NewRequestPage() {
  const navigate = useNavigate()
  const { organization: org, loading: orgLoading, error: orgError } = useCBOOrganization()

  const [causeAreas, setCauseAreas] = useState<any[]>([])
  const [challengeCategories, setChallengeCategories] = useState<any[]>([])
  const [identityCategories, setIdentityCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    urgency: 'medium',
    cause_area_id: '',
    zipcode: '',
    program_region_metro: '',
    program_region_county: '',
  })
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  const [selectedIdentities, setSelectedIdentities] = useState<string[]>([])

  useEffect(() => {
    if (orgError) { navigate(routes.cbo.setup); return }
    if (orgLoading || !org) return

    setFormData((prev) => ({ ...prev, zipcode: org.zipcode ?? '' }))

    const loadTaxonomy = async () => {
      try {
        const [caData, ccData, icData] = await Promise.all([
          (supabase as any).from('cause_areas').select('*').eq('is_active', true).order('name'),
          (supabase as any).from('challenge_categories').select('*').eq('is_active', true).order('name'),
          (supabase as any).from('identity_categories').select('*').eq('is_active', true).order('name'),
        ])
        setCauseAreas(caData.data ?? [])
        setChallengeCategories(ccData.data ?? [])
        setIdentityCategories(icData.data ?? [])
      } catch {
        setError('Failed to load form data')
      } finally {
        setLoading(false)
      }
    }

    loadTaxonomy()
  }, [org?.id, orgLoading, orgError, navigate])

  const toggleCategory = (id: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!org) return

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount < 1) {
      setError('Amount must be at least $1')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createRequestWithCategories(
        {
          organization_id: org.id,
          description: formData.description,
          amount,
          urgency: formData.urgency,
          cause_area_id: formData.cause_area_id,
          zipcode: formData.zipcode,
          program_region_metro: formData.program_region_metro || null,
          program_region_county: formData.program_region_county || null,
          status: 'open',
        },
        selectedChallenges,
        selectedIdentities
      )
      navigate(routes.cbo.requests)
    } catch (err: any) {
      setError(err.message || 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Create New Request</h1>
      <p className="text-muted-foreground mb-8">
        Describe the technology equipment your organization needs.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Tell donors what you need and why</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the equipment needed and how it will be used by your organization..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Needed ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency *</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(v) => setFormData((p) => ({ ...p, urgency: v }))}
                >
                  <SelectTrigger id="urgency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause_area">Cause Area *</Label>
              <Select
                value={formData.cause_area_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, cause_area_id: v }))}
                required
              >
                <SelectTrigger id="cause_area">
                  <SelectValue placeholder="Select cause area..." />
                </SelectTrigger>
                <SelectContent>
                  {causeAreas.map((ca: any) => (
                    <SelectItem key={ca.id} value={ca.id}>{ca.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipcode">Service Area Zipcode *</Label>
              <Input
                id="zipcode"
                value={formData.zipcode}
                onChange={(e) => setFormData((p) => ({ ...p, zipcode: e.target.value }))}
                placeholder="64101"
                required
              />
            </div>
          </CardContent>
        </Card>

        {challengeCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Challenge Areas</CardTitle>
              <CardDescription>Which challenges does this request address?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {challengeCategories.map((cat: any) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cc-${cat.id}`}
                      checked={selectedChallenges.includes(cat.id)}
                      onCheckedChange={() =>
                        toggleCategory(cat.id, selectedChallenges, setSelectedChallenges)
                      }
                    />
                    <Label htmlFor={`cc-${cat.id}`} className="font-normal cursor-pointer">
                      {cat.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {identityCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Communities Served</CardTitle>
              <CardDescription>Which communities will this request serve?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {identityCategories.map((cat: any) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`ic-${cat.id}`}
                      checked={selectedIdentities.includes(cat.id)}
                      onCheckedChange={() =>
                        toggleCategory(cat.id, selectedIdentities, setSelectedIdentities)
                      }
                    />
                    <Label htmlFor={`ic-${cat.id}`} className="font-normal cursor-pointer">
                      {cat.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(routes.cbo.requests)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !formData.cause_area_id}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
