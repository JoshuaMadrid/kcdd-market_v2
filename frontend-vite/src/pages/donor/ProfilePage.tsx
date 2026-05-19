import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Loader2, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  fetchDonorProfile,
  upsertDonorProfile,
  fetchCauseAreas,
  fetchDonorCauseAreas,
  upsertDonorCauseAreas,
} from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

export function DonorProfile() {
  const { user } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    phone: '',
    service_area_zipcode: '',
    max_per_request: '1000',
    profile_picture_url: '',
  })
  const [causeAreas, setCauseAreas] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCauseAreas, setSelectedCauseAreas] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchDonorProfile(user.id),
      fetchCauseAreas(),
      fetchDonorCauseAreas(user.id),
    ])
      .then(([profile, areas, selected]) => {
        if (profile) {
          setFormData({
            display_name: profile.display_name ?? '',
            bio: profile.bio ?? '',
            phone: profile.phone ?? '',
            service_area_zipcode: profile.service_area_zipcode ?? '',
            max_per_request: String(profile.max_per_request ?? 1000),
            profile_picture_url: profile.profile_picture_url ?? '',
          })
        }
        setCauseAreas(areas)
        setSelectedCauseAreas(selected)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const toggleCauseArea = (id: string) => {
    setSelectedCauseAreas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      await upsertDonorProfile(user.id, {
        display_name: formData.display_name || null,
        bio: formData.bio || null,
        phone: formData.phone || null,
        service_area_zipcode: formData.service_area_zipcode || null,
        max_per_request: parseFloat(formData.max_per_request) || 1000,
        profile_picture_url: formData.profile_picture_url || null,
        name: user.fullName ?? '',
        email: user.primaryEmailAddress?.emailAddress ?? '',
      })
      await upsertDonorCauseAreas(user.id, selectedCauseAreas)
      toast({ title: 'Profile saved', description: 'Your profile and interests have been updated.' })
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err.message || 'Could not save profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
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
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your donor profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-muted-foreground text-sm mt-1">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder={user?.fullName ?? 'Your name'}
              />
            </div>

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
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us a bit about yourself and why you donate..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Preferences</CardTitle>
            <CardDescription>Customize your donation settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max_per_request">Max Donation Per Request ($)</Label>
              <Input
                id="max_per_request"
                type="number"
                min="1"
                step="1"
                value={formData.max_per_request}
                onChange={(e) => handleChange('max_per_request', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum amount you're willing to donate for a single request
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_area_zipcode">Service Area Zipcode</Label>
              <Input
                id="service_area_zipcode"
                value={formData.service_area_zipcode}
                onChange={(e) => handleChange('service_area_zipcode', e.target.value)}
                placeholder="64101"
              />
              <p className="text-xs text-muted-foreground">
                Optionally limit donations to organizations in your area
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
              <Input
                id="profile_picture_url"
                type="url"
                value={formData.profile_picture_url}
                onChange={(e) => handleChange('profile_picture_url', e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notify me about</CardTitle>
            <CardDescription>
              Get an in-app alert when a new request matches your interests (and your max-per-request).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {causeAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cause areas available.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {causeAreas.map((ca) => (
                  <div key={ca.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`ca-${ca.id}`}
                      checked={selectedCauseAreas.includes(ca.id)}
                      onCheckedChange={() => toggleCauseArea(ca.id)}
                    />
                    <Label htmlFor={`ca-${ca.id}`} className="font-normal cursor-pointer">
                      {ca.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
