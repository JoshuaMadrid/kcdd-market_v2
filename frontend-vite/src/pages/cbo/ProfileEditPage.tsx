/**
 * CBO Profile Edit Page
 * Edit organization profile
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

const AGES_SERVED_OPTIONS = ['0-5', '6-12', '13-17', '18-24', '25-54', '55+'] as const
import { fetchOrganizationByUserId, updateOrganization } from '@/lib/supabase'
import { routes } from '@/config'
import type { Database } from '@/types/database'

type Organization = Database['public']['Tables']['organizations']['Row']

const organizationTypes = [
  '501(c)(3) Nonprofit',
  '501(c)(4) Social Welfare',
  'Community Group',
  'Faith-Based Organization',
  'Educational Institution',
  'Government Agency',
  'Other',
]

const organizationSizes = [
  'Small (1-10 employees)',
  'Medium (11-50 employees)',
  'Large (51-200 employees)',
  'Enterprise (200+ employees)',
]

export function CBOProfileEdit() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    tagline: string
    mission: string
    technology_barriers: string
    program_description: string
    service_area_description: string
    organization_type: string
    organization_size: string
    year_founded: string
    website: string
    email: string
    phone: string
    address: string
    zipcode: string
    ein: string
    logo_url: string
    cover_image_url: string
    ages_served: string[]
    pre_eligibility_status: string
  }>({
    name: '',
    tagline: '',
    mission: '',
    technology_barriers: '',
    program_description: '',
    service_area_description: '',
    organization_type: '',
    organization_size: '',
    year_founded: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    zipcode: '',
    ein: '',
    logo_url: '',
    cover_image_url: '',
    ages_served: [],
    pre_eligibility_status: '',
  })

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const orgData = await fetchOrganizationByUserId(user.id)
        setOrganization(orgData as unknown as Organization)

        if (orgData) {
          setFormData({
            name: orgData.name || '',
            tagline: orgData.tagline || '',
            mission: orgData.mission || '',
            technology_barriers: orgData.technology_barriers || '',
            program_description: orgData.program_description || '',
            service_area_description: orgData.service_area_description || '',
            organization_type: orgData.organization_type || '',
            organization_size: orgData.organization_size || '',
            year_founded: orgData.year_founded?.toString() || '',
            website: orgData.website || '',
            email: orgData.email || '',
            phone: orgData.phone || '',
            address: orgData.address || '',
            zipcode: orgData.zipcode || '',
            ein: orgData.ein || '',
            logo_url: orgData.logo_url || '',
            cover_image_url: orgData.cover_image_url || '',
            ages_served: orgData.ages_served ?? [],
            pre_eligibility_status: orgData.pre_eligibility_status ?? '',
          })
        }
      } catch (err) {
        console.error('Failed to load organization:', err)
        setError('Failed to load your organization')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return

    setIsSaving(true)
    setError(null)

    try {
      await updateOrganization(organization.id, {
        name: formData.name,
        tagline: formData.tagline || null,
        mission: formData.mission,
        technology_barriers: formData.technology_barriers || null,
        program_description: formData.program_description || null,
        service_area_description: formData.service_area_description || null,
        organization_type: formData.organization_type || null,
        organization_size: formData.organization_size || null,
        year_founded: formData.year_founded ? parseInt(formData.year_founded) : null,
        website: formData.website || null,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        zipcode: formData.zipcode,
        ein: formData.ein || null,
        logo_url: formData.logo_url || null,
        cover_image_url: formData.cover_image_url || null,
        ages_served: formData.ages_served.length > 0 ? formData.ages_served : null,
        pre_eligibility_status: formData.pre_eligibility_status || null,
      })

      navigate(routes.cbo.profile)
    } catch (err) {
      console.error('Failed to save:', err)
      setError('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 max-w-3xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">
          No Organization Found
        </h1>
        <p className="text-[#737373] mb-6">
          You need to set up an organization first.
        </p>
        <Link to={routes.cbo.setup}>
          <Button className="bg-[#ea580c] hover:bg-[#dc4c06] text-white">
            Set Up Organization
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to={routes.cbo.profile}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">Edit Organization Profile</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your organization's core details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="A brief slogan or description"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission">Mission Statement *</Label>
              <Textarea
                id="mission"
                value={formData.mission}
                onChange={(e) => handleChange('mission', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="organization_type">Organization Type</Label>
                <Select
                  value={formData.organization_type}
                  onValueChange={(value) => handleChange('organization_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization_size">Organization Size</Label>
                <Select
                  value={formData.organization_size}
                  onValueChange={(value) => handleChange('organization_size', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_founded">Year Founded</Label>
                <Input
                  id="year_founded"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.year_founded}
                  onChange={(e) => handleChange('year_founded', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs & Services */}
        <Card>
          <CardHeader>
            <CardTitle>Programs & Services</CardTitle>
            <CardDescription>Describe what your organization does</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="program_description">Program Description</Label>
              <Textarea
                id="program_description"
                value={formData.program_description}
                onChange={(e) => handleChange('program_description', e.target.value)}
                rows={4}
                placeholder="Describe your core programs and services..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technology_barriers">Technology Barriers</Label>
              <Textarea
                id="technology_barriers"
                value={formData.technology_barriers}
                onChange={(e) => handleChange('technology_barriers', e.target.value)}
                rows={4}
                placeholder="Describe the technology barriers or digital access issues your clients face..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_area_description">Service Area</Label>
              <Textarea
                id="service_area_description"
                value={formData.service_area_description}
                onChange={(e) => handleChange('service_area_description', e.target.value)}
                rows={2}
                placeholder="Describe the geographic area you serve..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Population Served */}
        <Card>
          <CardHeader>
            <CardTitle>Population Served</CardTitle>
            <CardDescription>Who does your organization serve?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ages Served</Label>
              <div className="flex flex-wrap gap-3 mt-1">
                {AGES_SERVED_OPTIONS.map((opt) => {
                  const checked = formData.ages_served.includes(opt)
                  return (
                    <div key={opt} className="flex items-center gap-2">
                      <Checkbox
                        id={`age-${opt}`}
                        checked={checked}
                        onCheckedChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            ages_served: v
                              ? [...prev.ages_served, opt]
                              : prev.ages_served.filter((a) => a !== opt),
                          }))
                        }
                      />
                      <Label htmlFor={`age-${opt}`} className="font-normal cursor-pointer">
                        {opt}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pre_eligibility_status">Pre-Eligibility Requirements</Label>
              <Input
                id="pre_eligibility_status"
                value={formData.pre_eligibility_status}
                onChange={(e) => handleChange('pre_eligibility_status', e.target.value)}
                placeholder="e.g. income-verified, referral required"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How people can reach your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipcode">Zipcode *</Label>
                <Input
                  id="zipcode"
                  value={formData.zipcode}
                  onChange={(e) => handleChange('zipcode', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ein">EIN (Tax ID)</Label>
              <Input
                id="ein"
                value={formData.ein}
                onChange={(e) => handleChange('ein', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Your organization's visual identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_image_url">Cover Image URL</Label>
              <Input
                id="cover_image_url"
                type="url"
                value={formData.cover_image_url}
                onChange={(e) => handleChange('cover_image_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-[#fee2e2] border border-[#fca5a5] text-[#dc2626] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link to={routes.cbo.profile}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#ea580c] hover:bg-[#dc4c06] text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
