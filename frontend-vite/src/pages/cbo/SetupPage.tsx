import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createOrganization, fetchOrganizationByUserId, supabase } from '@/lib/supabase'
import { routes } from '@/config'

const organizationTypes = [
  '501(c)(3) Nonprofit',
  '501(c)(4) Social Welfare',
  'Community Group',
  'Faith-Based Organization',
  'Educational Institution',
  'Government Agency',
  'Other',
]

export function CBOSetup() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    mission: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    zipcode: '',
    organization_type: '',
    ein: '',
  })

  useEffect(() => {
    if (!user) return
    fetchOrganizationByUserId(user.id)
      .then(() => navigate(routes.cbo.profile, { replace: true }))
      .catch(() => setChecking(false))
  }, [user, navigate])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    try {
      await createOrganization({
        user_id: user.id,
        name: formData.name,
        mission: formData.mission,
        email: formData.email,
        phone: formData.phone || null,
        website: formData.website || null,
        address: formData.address || null,
        zipcode: formData.zipcode,
        organization_type: formData.organization_type || null,
        ein: formData.ein || null,
        logo_emoji: '🏢',
      })

      await (supabase as any)
        .from('user_profiles')
        .update({ user_type: 'cbo' })
        .eq('id', user.id)

      navigate(routes.cbo.profile)
    } catch (err: any) {
      setError(err.message || 'Failed to create organization')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Organization Setup</h1>
      <p className="text-muted-foreground mb-8">
        Create your organization profile to start receiving technology donations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Kansas City Community Center"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission">Mission Statement *</Label>
              <Textarea
                id="mission"
                value={formData.mission}
                onChange={(e) => handleChange('mission', e.target.value)}
                placeholder="Describe your organization's mission and the community you serve..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_type">Organization Type</Label>
              <Select
                value={formData.organization_type}
                onValueChange={(v) => handleChange('organization_type', v)}
              >
                <SelectTrigger id="organization_type">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {organizationTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@yourorg.org"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(816) 555-0100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://yourorg.org"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St, Kansas City, MO"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipcode">Zipcode *</Label>
                <Input
                  id="zipcode"
                  value={formData.zipcode}
                  onChange={(e) => handleChange('zipcode', e.target.value)}
                  placeholder="64101"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ein">EIN</Label>
                <Input
                  id="ein"
                  value={formData.ein}
                  onChange={(e) => handleChange('ein', e.target.value)}
                  placeholder="12-3456789"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Organization...
            </>
          ) : (
            'Create Organization Profile'
          )}
        </Button>
      </form>
    </div>
  )
}
