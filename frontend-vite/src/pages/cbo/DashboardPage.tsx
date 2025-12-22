/**
 * CBO Dashboard Page
 * Fully functional dashboard with real Supabase data
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
import { 
  AlertTriangle, 
  Settings,
  LayoutDashboard,
  List,
  BarChart3,
  FileText,
  HelpCircle,
  Search,
  PanelLeft,
  TrendingUp,
  Columns2,
  Plus,
  GripVertical,
  MoreVertical,
  Loader2,
  RefreshCw,
  DollarSign,
  CheckCircle,
  Clock,
  Building2,
  ExternalLink,
  Users
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  fetchCBODashboardStats, 
  fetchCBORequests,
  checkOnboardingStatus,
  getOrganizationByUserId,
  type CBODashboardStats,
  type RequestRecord
} from '@/lib/supabase'

// Stat card component with real data
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
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
    </Card>
  )
}

// Request table row component
interface RequestRowProps {
  request: RequestRecord
  selected: boolean
  onSelect: () => void
}

function RequestRow({ request, selected, onSelect }: RequestRowProps) {
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
            <p className="font-medium text-gray-900 text-sm max-w-[200px] truncate">{request.description}</p>
            <p className="text-xs text-gray-500">{request.cause_area_name}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge className={urgencyColors[request.urgency]} variant="secondary">
          {request.urgency}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <Badge className={statusColors[request.status]} variant="secondary">
          {request.status}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <span className="font-semibold text-gray-900">${request.amount.toLocaleString()}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-500">{request.zipcode}</span>
      </td>
      <td className="py-3 px-4">
        {request.donor_email ? (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <Users className="h-3 w-3 mr-1" />
            Donor Assigned
          </Badge>
        ) : (
          <span className="text-sm text-gray-400">No donor yet</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-500">{formatDate(request.created_at)}</span>
      </td>
      <td className="py-3 px-4">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}

// Empty state component
function EmptyState({ onCreateRequest }: { onCreateRequest: () => void }) {
  return (
    <div className="text-center py-12">
      <List className="h-12 w-12 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Create your first request to start receiving donations from our community of donors.
      </p>
      <Button onClick={onCreateRequest} className="bg-emerald-600 hover:bg-emerald-700">
        <Plus className="h-4 w-4 mr-2" />
        Create First Request
      </Button>
    </div>
  )
}

// No Organization state
function NoOrganizationState({ onSetup }: { onSetup: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="max-w-md p-8 text-center">
        <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Set Up Your Organization</h2>
        <p className="text-gray-500 mb-6">
          Complete your organization profile to start creating requests and receiving donations.
        </p>
        <Button onClick={onSetup} className="bg-emerald-600 hover:bg-emerald-700">
          <Settings className="h-4 w-4 mr-2" />
          Complete Setup
        </Button>
      </Card>
    </div>
  )
}

export function CBODashboard() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  
  // Data state
  const [stats, setStats] = useState<CBODashboardStats | null>(null)
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [organization, setOrganization] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [hasOrganization, setHasOrganization] = useState(true)

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Check onboarding status
      const onboardingStatus = await checkOnboardingStatus(user.id, 'cbo')
      setNeedsOnboarding(!onboardingStatus.onboarding_complete)

      // Get organization
      const org = await getOrganizationByUserId(user.id)
      if (!org) {
        setHasOrganization(false)
        setLoading(false)
        return
      }
      setOrganization(org)
      setHasOrganization(true)

      // Fetch stats and requests in parallel
      const [statsData, requestsData] = await Promise.all([
        fetchCBODashboardStats(user.id),
        fetchCBORequests(user.id, {
          status: activeTab === 'all' ? undefined : activeTab,
          search: searchQuery || undefined
        })
      ])

      setStats(statsData)
      setRequests(requestsData)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user?.id, activeTab, searchQuery])

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchData()
    }
  }, [isLoaded, user?.id, fetchData])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoaded && user?.id && hasOrganization) {
        fetchData()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

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
    if (selectedRows.size === requests.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(requests.map(r => r.id)))
    }
  }

  const handleCreateRequest = () => {
    navigate('/cbo/requests/new')
  }

  const handleSetup = () => {
    navigate('/cbo/setup')
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  // No organization state
  if (!loading && !hasOrganization) {
    return <NoOrganizationState onSetup={handleSetup} />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r border-gray-200 bg-white`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && <span className="font-semibold text-gray-900 truncate">{organization?.name || 'Organization'}</span>}
          </div>
        </div>
        
        <SidebarGroup label={sidebarOpen ? "Menu" : undefined}>
          <SidebarItem icon={<LayoutDashboard className="h-4 w-4" />} active>
            {sidebarOpen && "Dashboard"}
          </SidebarItem>
          <SidebarItem icon={<List className="h-4 w-4" />}>
            {sidebarOpen && "My Requests"}
          </SidebarItem>
          <SidebarItem 
            icon={<Plus className="h-4 w-4" />}
            onClick={handleCreateRequest}
          >
            {sidebarOpen && "New Request"}
          </SidebarItem>
          <SidebarItem icon={<BarChart3 className="h-4 w-4" />}>
            {sidebarOpen && "Analytics"}
          </SidebarItem>
        </SidebarGroup>

        <SidebarGroup label={sidebarOpen ? "Organization" : undefined}>
          <SidebarItem icon={<FileText className="h-4 w-4" />}>
            {sidebarOpen && "Documents"}
          </SidebarItem>
          <SidebarItem icon={<Settings className="h-4 w-4" />}>
            {sidebarOpen && "Settings"}
          </SidebarItem>
          <SidebarItem icon={<HelpCircle className="h-4 w-4" />}>
            {sidebarOpen && "Support"}
          </SidebarItem>
        </SidebarGroup>

        <SidebarFooter>
          <div className={`flex items-center gap-3 p-2 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
              {organization?.logo_emoji || organization?.name?.[0] || 'O'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.emailAddresses?.[0]?.emailAddress}
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
                  <span className="text-gray-900">CBO Dashboard</span>
                </nav>
                <h1 className="text-xl font-semibold text-gray-900 mt-1">
                  {organization?.name || 'Your Organization'}
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
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleCreateRequest}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Onboarding Alert */}
          {needsOnboarding && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Complete Your Profile</AlertTitle>
              <AlertDescription className="text-amber-700 flex items-center justify-between">
                <span>Please complete your organization profile to start receiving donations.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={handleSetup}
                >
                  <Settings className="size-4 mr-2" />
                  Complete Setup
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700 flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchData}
                  className="ml-4 border-red-300 text-red-800 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Received"
              value={stats ? `$${stats.totalReceived.toLocaleString()}` : '$0'}
              subtitle="From fulfilled requests"
              icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
              loading={loading}
            />
            <StatCard
              title="Fulfilled Requests"
              value={stats?.fulfilledRequests || 0}
              subtitle="Completed donations"
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              loading={loading}
            />
            <StatCard
              title="Active Requests"
              value={stats?.activeRequests || 0}
              subtitle="Currently being fulfilled"
              icon={<Clock className="h-5 w-5 text-amber-500" />}
              loading={loading}
            />
            <StatCard
              title="Open Requests"
              value={stats?.pendingRequests || 0}
              subtitle="Waiting for donors"
              icon={<List className="h-5 w-5 text-blue-600" />}
              loading={loading}
            />
          </div>

          {/* Requests Table */}
          <Card className="border border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Requests</h2>
                  <p className="text-sm text-gray-500">Manage and track your donation requests</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search requests..."
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
                      {requests.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="open" className="data-[state=active]:bg-white">
                    Open
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                      {requests.filter(r => r.status === 'open').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="claimed" className="data-[state=active]:bg-white">
                    Active
                    <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">
                      {requests.filter(r => r.status === 'claimed').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="fulfilled" className="data-[state=active]:bg-white">
                    Fulfilled
                    <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                      {requests.filter(r => r.status === 'fulfilled').length}
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
            ) : requests.length === 0 ? (
              <EmptyState onCreateRequest={handleCreateRequest} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <Checkbox 
                          checked={selectedRows.size === requests.length && requests.length > 0}
                          onCheckedChange={toggleAllRows}
                        />
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request
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
                        Zipcode
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
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
                    {requests.map((request) => (
                      <RequestRow
                        key={request.id}
                        request={request}
                        selected={selectedRows.has(request.id)}
                        onSelect={() => toggleRowSelection(request.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {requests.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
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
            )}
          </Card>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={handleCreateRequest}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create New Request</h3>
                  <p className="text-sm text-gray-500">Submit a new donation request</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-500">Track your organization's impact</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={handleSetup}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Organization Settings</h3>
                  <p className="text-sm text-gray-500">Update profile and preferences</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
