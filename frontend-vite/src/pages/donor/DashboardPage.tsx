/**
 * Donor Dashboard Page
 * Fully functional dashboard with Supabase data + demo fallback
 */

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sidebar, SidebarGroup, SidebarItem, SidebarFooter } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { OnboardingModal } from '@/components/OnboardingModal'
import { 
  AlertTriangle, 
  Settings,
  LayoutDashboard,
  Heart,
  BarChart3,
  FileText,
  HelpCircle,
  Search,
  PanelLeft,
  TrendingUp,
  Columns2,
  GripVertical,
  MoreVertical,
  Loader2,
  RefreshCw,
  DollarSign,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  fetchDonorDashboardStats, 
  fetchDonorDonations,
  checkOnboardingStatus,
  type DonorDashboardStats,
  type DonationRecord
} from '@/lib/supabase'

// Demo data for when there's no real data
const DEMO_STATS: DonorDashboardStats = {
  totalDonations: 2847,
  requestsFulfilled: 12,
  requestsClaimed: 3,
  causesSupported: 5
}

const DEMO_DONATIONS: DonationRecord[] = [
  {
    id: '1',
    description: 'Laptop for remote learning student',
    amount: 450,
    status: 'fulfilled',
    urgency: 'high',
    organization_name: 'KC Youth Education',
    organization_logo_emoji: '📚',
    cause_area_name: 'Education',
    created_at: '2024-12-15T10:30:00Z',
    claimed_at: '2024-12-15T14:00:00Z',
    fulfilled_at: '2024-12-18T09:00:00Z'
  },
  {
    id: '2',
    description: 'Internet hotspot for family of 4',
    amount: 120,
    status: 'fulfilled',
    urgency: 'medium',
    organization_name: 'Digital Bridge KC',
    organization_logo_emoji: '🌐',
    cause_area_name: 'Digital Access',
    created_at: '2024-12-10T08:00:00Z',
    claimed_at: '2024-12-10T12:00:00Z',
    fulfilled_at: '2024-12-12T16:00:00Z'
  },
  {
    id: '3',
    description: 'Tablet for senior citizen tech classes',
    amount: 280,
    status: 'claimed',
    urgency: 'low',
    organization_name: 'Senior Tech Connect',
    organization_logo_emoji: '👴',
    cause_area_name: 'Senior Services',
    created_at: '2024-12-20T11:00:00Z',
    claimed_at: '2024-12-20T15:00:00Z',
    fulfilled_at: null
  },
  {
    id: '4',
    description: 'Computer monitors for nonprofit office',
    amount: 350,
    status: 'claimed',
    urgency: 'medium',
    organization_name: 'Community Action Network',
    organization_logo_emoji: '🏢',
    cause_area_name: 'Nonprofit Support',
    created_at: '2024-12-19T09:00:00Z',
    claimed_at: '2024-12-19T13:00:00Z',
    fulfilled_at: null
  },
  {
    id: '5',
    description: 'Webcam and headset for job interviews',
    amount: 85,
    status: 'fulfilled',
    urgency: 'high',
    organization_name: 'Employment First KC',
    organization_logo_emoji: '💼',
    cause_area_name: 'Employment',
    created_at: '2024-12-08T14:00:00Z',
    claimed_at: '2024-12-08T16:00:00Z',
    fulfilled_at: '2024-12-09T10:00:00Z'
  },
  {
    id: '6',
    description: 'Printer for small business startup',
    amount: 199,
    status: 'fulfilled',
    urgency: 'medium',
    organization_name: 'Entrepreneurship Hub',
    organization_logo_emoji: '🚀',
    cause_area_name: 'Small Business',
    created_at: '2024-12-05T10:00:00Z',
    claimed_at: '2024-12-05T11:30:00Z',
    fulfilled_at: '2024-12-07T14:00:00Z'
  }
]

// Stat card component
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: string; positive: boolean }
  icon: React.ReactNode
  loading?: boolean
}

function StatCard({ title, value, subtitle, trend, icon, loading }: StatCardProps) {
  return (
    <Card className="p-4 bg-white border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="h-8 flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          )}
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${!trend.positive && 'rotate-180'}`} />
              {trend.value}
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-100 rounded-lg">
          {icon}
        </div>
      </div>
    </Card>
  )
}

// Donation table row component
interface DonationRowProps {
  donation: DonationRecord
  selected: boolean
  onSelect: () => void
}

function DonationRow({ donation, selected, onSelect }: DonationRowProps) {
  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    claimed: 'bg-amber-100 text-amber-800',
    fulfilled: 'bg-emerald-100 text-emerald-800',
    denied: 'bg-red-100 text-red-800'
  }

  const urgencyColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected ? 'bg-blue-50' : ''}`}>
      <td className="py-3 px-4">
        <Checkbox checked={selected} onCheckedChange={onSelect} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
          <div>
            <p className="font-medium text-gray-900 text-sm">{donation.organization_name}</p>
            <p className="text-xs text-gray-500 max-w-[200px] truncate">{donation.description}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge className={urgencyColors[donation.urgency]} variant="secondary">
          {donation.urgency}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <Badge className={statusColors[donation.status]} variant="secondary">
          {donation.status}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <span className="font-semibold text-gray-900">${donation.amount.toLocaleString()}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-500">{donation.cause_area_name}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-500">{formatDate(donation.created_at)}</span>
      </td>
      <td className="py-3 px-4">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}


export function DonorDashboard() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  
  // Data state - use demo data as fallback
  const [stats, setStats] = useState<DonorDashboardStats>(DEMO_STATS)
  const [donations, setDonations] = useState<DonationRecord[]>(DEMO_DONATIONS)
  const [loading, setLoading] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(true)

  // Filter donations based on active tab
  const filteredDonations = donations.filter(d => {
    if (activeTab === 'all') return true
    return d.status === activeTab
  }).filter(d => {
    if (!searchQuery) return true
    return d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.organization_name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Fetch real data if available
  const fetchData = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const onboardingStatus = await checkOnboardingStatus(user.id, 'donor')
      setNeedsOnboarding(!onboardingStatus.onboarding_complete)

      const [statsData, donationsData] = await Promise.all([
        fetchDonorDashboardStats(user.id),
        fetchDonorDonations(user.id)
      ])

      // Only use real data if there is some, otherwise keep demo data
      if (donationsData && donationsData.length > 0) {
        setStats(statsData)
        setDonations(donationsData)
      }
    } catch (err) {
      console.log('Using demo data')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchData()
    }
  }, [isLoaded, user?.id, fetchData])

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const toggleAllRows = () => {
    if (selectedRows.size === filteredDonations.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredDonations.map(d => d.id)))
    }
  }

  const handleBrowseRequests = () => navigate('/requests')

  // Check if current path matches
  const isActive = (path: string) => location.pathname === path

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={() => {
          setShowOnboardingModal(false)
          setNeedsOnboarding(false)
          fetchData() // Refresh data after completion
        }}
        userType="donor"
      />

      {/* Sidebar */}
      <Sidebar className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r border-gray-200 bg-white`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && <span className="font-semibold text-gray-900">KC Digital Drive</span>}
          </div>
        </div>
        
        <SidebarGroup label={sidebarOpen ? "Menu" : undefined}>
          <SidebarItem 
            icon={<LayoutDashboard className="h-4 w-4 text-gray-700" />} 
            active={isActive('/donor/dashboard')}
            onClick={() => navigate('/donor/dashboard')}
          >
            {sidebarOpen && "Dashboard"}
          </SidebarItem>
          <SidebarItem 
            icon={<Heart className="h-4 w-4 text-gray-700" />}
            active={isActive('/requests')}
            onClick={() => navigate('/requests')}
          >
            {sidebarOpen && "Browse Requests"}
          </SidebarItem>
          <SidebarItem 
            icon={<BarChart3 className="h-4 w-4 text-gray-700" />}
            active={isActive('/donor/impact')}
            onClick={() => navigate('/donor/impact')}
          >
            {sidebarOpen && "Impact Report"}
          </SidebarItem>
          <SidebarItem 
            icon={<FileText className="h-4 w-4 text-gray-700" />}
            active={isActive('/donor/documents')}
            onClick={() => navigate('/donor/documents')}
          >
            {sidebarOpen && "Tax Documents"}
          </SidebarItem>
        </SidebarGroup>

        <SidebarGroup label={sidebarOpen ? "Account" : undefined}>
          <SidebarItem 
            icon={<Settings className="h-4 w-4 text-gray-700" />}
            active={isActive('/donor/settings')}
            onClick={() => setShowOnboardingModal(true)}
          >
            {sidebarOpen && "Settings"}
          </SidebarItem>
          <SidebarItem 
            icon={<HelpCircle className="h-4 w-4 text-gray-700" />}
            active={isActive('/donor/support')}
            onClick={() => navigate('/donor/support')}
          >
            {sidebarOpen && "Support"}
          </SidebarItem>
        </SidebarGroup>

        <SidebarFooter>
          <div className={`flex items-center gap-3 p-2 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
              {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'D'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || 'Demo User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.emailAddresses?.[0]?.emailAddress || 'demo@example.com'}
                </p>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 p-0"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div>
                <nav className="flex items-center gap-2 text-sm text-gray-500">
                  <Link to="/" className="hover:text-gray-700">Home</Link>
                  <span>/</span>
                  <span className="text-gray-900">Donor Dashboard</span>
                </nav>
                <h1 className="text-xl font-semibold text-gray-900 mt-1">
                  Welcome back, {user?.firstName || 'there'}!
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                className="bg-gray-900 hover:bg-gray-800"
                onClick={handleBrowseRequests}
              >
                <Heart className="h-4 w-4 mr-2" />
                Browse Requests
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Onboarding Alert with Settings Button */}
          {needsOnboarding && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Complete Your Profile</AlertTitle>
              <AlertDescription className="text-amber-700 flex items-center justify-between">
                <span>Please complete your profile setup to get started donating.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={() => setShowOnboardingModal(true)}
                >
                  <Settings className="size-4 mr-2" />
                  Complete Setup
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Donated"
              value={`$${stats.totalDonations.toLocaleString()}`}
              subtitle="All time contributions"
              trend={{ value: '+12% this month', positive: true }}
              icon={<DollarSign className="h-5 w-5 text-gray-700" />}
              loading={loading}
            />
            <StatCard
              title="Requests Fulfilled"
              value={stats.requestsFulfilled}
              subtitle="Completed donations"
              trend={{ value: '+3 this month', positive: true }}
              icon={<CheckCircle className="h-5 w-5 text-gray-700" />}
              loading={loading}
            />
            <StatCard
              title="In Progress"
              value={stats.requestsClaimed}
              subtitle="Awaiting fulfillment"
              icon={<Clock className="h-5 w-5 text-gray-700" />}
              loading={loading}
            />
            <StatCard
              title="Causes Supported"
              value={stats.causesSupported}
              subtitle="Different cause areas"
              icon={<Target className="h-5 w-5 text-gray-700" />}
              loading={loading}
            />
          </div>

          {/* Donations Table */}
          <Card className="border border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Donations</h2>
                  <p className="text-sm text-gray-500">Track and manage your donation history</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search donations..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Columns2 className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white">
                    All
                    <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-600">
                      {donations.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="claimed" className="data-[state=active]:bg-white">
                    In Progress
                    <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">
                      {donations.filter(d => d.status === 'claimed').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="fulfilled" className="data-[state=active]:bg-white">
                    Fulfilled
                    <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                      {donations.filter(d => d.status === 'fulfilled').length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <Checkbox 
                          checked={selectedRows.size === filteredDonations.length && filteredDonations.length > 0}
                          onCheckedChange={toggleAllRows}
                        />
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Urgency
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cause Area
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((donation) => (
                      <DonationRow
                        key={donation.id}
                        donation={donation}
                        selected={selectedRows.has(donation.id)}
                        onSelect={() => toggleRowSelection(donation.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {filteredDonations.length} of {donations.length} donation{donations.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </Card>

        </main>
      </div>
    </div>
  )
}
