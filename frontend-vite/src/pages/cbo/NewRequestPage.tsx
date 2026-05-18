import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Check } from 'lucide-react'
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
import type { NeedFrequency } from '@/types/database'

const TOTAL_STEPS = 3
const ESSAY_MAX = 5000
const DISTRIBUTION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'individual', label: 'Individual Recipients' },
  { value: 'computer_lab', label: 'Computer Lab' },
  { value: 'shared', label: 'Shared Device Pool' },
]

type FormData = {
  // Step 1 — basics
  description: string
  amount: string
  urgency: 'low' | 'medium' | 'high'
  cause_area_id: string
  zipcode: string
  program_region_metro: string
  program_region_county: string
  // Step 2 — device + logistics
  desktops: string
  laptops: string
  tablets: string
  smartphones: string
  refurbished_ok: boolean
  has_supplier: boolean
  has_it_support: boolean
  distribution_method: string[]
  need_frequency: NeedFrequency | ''
  // Step 3 — essays
  essay_technology_gap: string
  essay_population_impact: string
  essay_prior_support: string
  essay_sustainability: string
  essay_it_capacity: string
  essay_urgency_narrative: string
}

const initialFormData: FormData = {
  description: '',
  amount: '',
  urgency: 'medium',
  cause_area_id: '',
  zipcode: '',
  program_region_metro: '',
  program_region_county: '',
  desktops: '',
  laptops: '',
  tablets: '',
  smartphones: '',
  refurbished_ok: false,
  has_supplier: false,
  has_it_support: false,
  distribution_method: [],
  need_frequency: '',
  essay_technology_gap: '',
  essay_population_impact: '',
  essay_prior_support: '',
  essay_sustainability: '',
  essay_it_capacity: '',
  essay_urgency_narrative: '',
}

function validateStep(step: number, fd: FormData): string | null {
  if (step === 1) {
    if (!fd.description.trim()) return 'Description is required'
    const amount = parseFloat(fd.amount)
    if (isNaN(amount) || amount < 1) return 'Amount must be at least $1'
    if (amount > 10000) return 'Amount cannot exceed $10,000'
    if (!fd.cause_area_id) return 'Cause area is required'
    if (!fd.zipcode.trim()) return 'Zipcode is required'
    return null
  }
  if (step === 2) {
    const totalDevices =
      (parseInt(fd.desktops) || 0) +
      (parseInt(fd.laptops) || 0) +
      (parseInt(fd.tablets) || 0) +
      (parseInt(fd.smartphones) || 0)
    if (totalDevices <= 0) return 'Please specify at least one device type with a count greater than 0'
    return null
  }
  if (step === 3) {
    if (!fd.essay_technology_gap.trim()) return 'Technology Gap essay is required'
    if (!fd.essay_population_impact.trim()) return 'Population Impact essay is required'
    return null
  }
  return null
}

export function NewRequestPage() {
  const navigate = useNavigate()
  const { organization: org, loading: orgLoading, error: orgError } = useCBOOrganization()

  const [causeAreas, setCauseAreas] = useState<any[]>([])
  const [challengeCategories, setChallengeCategories] = useState<any[]>([])
  const [identityCategories, setIdentityCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  const [formData, setFormData] = useState<FormData>(initialFormData)
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

  const toggleListItem = (list: string[], id: string): string[] =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((p) => ({ ...p, [key]: value }))
  }

  const handleNext = () => {
    const err = validateStep(currentStep, formData)
    if (err) { setError(err); return }
    setError(null)
    setCurrentStep((s) => (Math.min(s + 1, TOTAL_STEPS) as 1 | 2 | 3))
  }

  const handleBack = () => {
    setError(null)
    setCurrentStep((s) => (Math.max(s - 1, 1) as 1 | 2 | 3))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!org) return

    const err = validateStep(3, formData)
    if (err) { setError(err); return }

    setSubmitting(true)
    setError(null)

    const amount = parseFloat(formData.amount)

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
          device_type_breakdown: {
            desktops: parseInt(formData.desktops) || 0,
            laptops: parseInt(formData.laptops) || 0,
            tablets: parseInt(formData.tablets) || 0,
            smartphones: parseInt(formData.smartphones) || 0,
          },
          refurbished_ok: formData.refurbished_ok,
          has_supplier: formData.has_supplier,
          has_it_support: formData.has_it_support,
          distribution_method:
            formData.distribution_method.length > 0 ? formData.distribution_method : null,
          need_frequency: formData.need_frequency || null,
          essay_technology_gap: formData.essay_technology_gap || null,
          essay_population_impact: formData.essay_population_impact || null,
          essay_prior_support: formData.essay_prior_support || null,
          essay_sustainability: formData.essay_sustainability || null,
          essay_it_capacity: formData.essay_it_capacity || null,
          essay_urgency_narrative: formData.essay_urgency_narrative || null,
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

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s, idx) => {
          const isActive = currentStep === s
          const isComplete = currentStep > s
          const label = s === 1 ? 'Basics' : s === 2 ? 'Devices' : 'Essays'
          return (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : isComplete
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'bg-background text-muted-foreground border-muted'
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : s}
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-0.5 mx-2 ${isComplete ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============ STEP 1 — Basics ============ */}
        {currentStep === 1 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Request Basics</CardTitle>
                <CardDescription>Tell donors what you need and why</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Describe the equipment needed and how it will be used..."
                    rows={4}
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
                      onChange={(e) => setField('amount', e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency *</Label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(v) => setField('urgency', v as 'low' | 'medium' | 'high')}
                    >
                      <SelectTrigger id="urgency"><SelectValue /></SelectTrigger>
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
                    onValueChange={(v) => setField('cause_area_id', v)}
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
                    onChange={(e) => setField('zipcode', e.target.value)}
                    placeholder="64101"
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
                            setSelectedChallenges((p) => toggleListItem(p, cat.id))
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
                            setSelectedIdentities((p) => toggleListItem(p, cat.id))
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
          </>
        )}

        {/* ============ STEP 2 — Devices & Logistics ============ */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Devices & Logistics</CardTitle>
              <CardDescription>How many devices do you need, and how will they be used?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-semibold">Device Inventory *</Label>
                <p className="text-xs text-muted-foreground mb-3">At least one count must be greater than 0.</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['desktops', 'laptops', 'tablets', 'smartphones'] as const).map((key) => (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={`device-${key}`} className="font-normal capitalize">
                        {key}
                      </Label>
                      <Input
                        id={`device-${key}`}
                        type="number"
                        min="0"
                        value={formData[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold block mb-3">Preferences</Label>
                <div className="space-y-2">
                  {(
                    [
                      { key: 'refurbished_ok', label: 'Refurbished devices are acceptable' },
                      { key: 'has_supplier', label: 'We already have a device supplier' },
                      { key: 'has_it_support', label: 'We have in-house IT support' },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={`pref-${key}`}
                        checked={formData[key]}
                        onCheckedChange={(v) => setField(key, Boolean(v))}
                      />
                      <Label htmlFor={`pref-${key}`} className="font-normal cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold block mb-3">Distribution Method</Label>
                <div className="space-y-2">
                  {DISTRIBUTION_OPTIONS.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`dist-${value}`}
                        checked={formData.distribution_method.includes(value)}
                        onCheckedChange={() =>
                          setField(
                            'distribution_method',
                            toggleListItem(formData.distribution_method, value)
                          )
                        }
                      />
                      <Label htmlFor={`dist-${value}`} className="font-normal cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold block mb-3">Need Frequency</Label>
                <div className="space-y-2">
                  {(
                    [
                      { value: 'one_time' as const, label: 'One-Time Need' },
                      { value: 'recurring' as const, label: 'Recurring / Ongoing Need' },
                    ]
                  ).map(({ value, label }) => (
                    <label
                      key={value}
                      htmlFor={`freq-${value}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        id={`freq-${value}`}
                        type="radio"
                        name="need_frequency"
                        value={value}
                        checked={formData.need_frequency === value}
                        onChange={() => setField('need_frequency', value)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============ STEP 3 — Essays ============ */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Application Essays</CardTitle>
              <CardDescription>
                Help donors understand the depth of your need. First two are required; the rest are optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(
                [
                  { key: 'essay_technology_gap', label: 'Technology Gap *', required: true,
                    placeholder: 'Describe how lack of devices limits your program\'s effectiveness.' },
                  { key: 'essay_population_impact', label: 'Population Impact *', required: true,
                    placeholder: 'Who will be served and how will this change their outcomes?' },
                  { key: 'essay_prior_support', label: 'Prior Support', required: false,
                    placeholder: 'Has the device gap been addressed in the past? By whom?' },
                  { key: 'essay_sustainability', label: 'Sustainability Plan', required: false,
                    placeholder: 'How will you sustain or grow this work after the donation?' },
                  { key: 'essay_it_capacity', label: 'IT Capacity', required: false,
                    placeholder: 'What IT support, staff, or partners maintain the devices?' },
                  { key: 'essay_urgency_narrative', label: 'Urgency Narrative', required: false,
                    placeholder: 'Why is this need time-sensitive?' },
                ] as const
              ).map(({ key, label, placeholder }) => {
                const value = formData[key]
                const atLimit = value.length >= ESSAY_MAX
                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Textarea
                      id={key}
                      value={value}
                      onChange={(e) => setField(key, e.target.value.slice(0, ESSAY_MAX))}
                      placeholder={placeholder}
                      rows={5}
                    />
                    <p className={`text-xs text-right ${atLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {value.length} / {ESSAY_MAX}
                    </p>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(routes.cbo.requests)}
            disabled={submitting}
          >
            Cancel
          </Button>
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack} disabled={submitting}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={handleNext}>
              Next →
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
