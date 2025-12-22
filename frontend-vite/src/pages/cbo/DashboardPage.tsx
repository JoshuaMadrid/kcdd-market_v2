/**
 * CBO Dashboard Page
 * Styled to match Figma design
 */

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { OnboardingModal } from '@/components/OnboardingModal'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  Columns2,
  Loader,
  PanelLeft,
  Plus,
  TrendingUp,
  MoreVertical,
  LayoutDashboard,
  List,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Search,
  AlertTriangle,
  Loader2,
  Building2,
  Clock,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  fetchCBODashboardStats,
  fetchCBORequests,
  checkOnboardingStatus,
  getOrganizationByUserId,
  type CBODashboardStats,
  type RequestRecord
} from '@/lib/supabase'

// Demo data
const DEMO_STATS: CBODashboardStats = {
  totalReceived: 12450,
  activeRequests: 5,
  fulfilledRequests: 28,
  pendingRequests: 3
}

const DEMO_REQUESTS: RequestRecord[] = [
  {
    id: '1',
    description: 'Laptops for after-school program',
    amount: 2500,
    status: 'open',
    urgency: 'high',
    cause_area_name: 'Education',
    donor_email: null,
    created_at: '2024-12-20T10:00:00Z',
    claimed_at: null,
    fulfilled_at: null
  },
  {
    id: '2',
    description: 'Internet hotspots for families',
    amount: 800,
    status: 'claimed',
    urgency: 'medium',
    cause_area_name: 'Digital Access',
    donor_email: 'donor@example.com',
    created_at: '2024-12-18T14:00:00Z',
    claimed_at: '2024-12-19T09:00:00Z',
    fulfilled_at: null
  },
  {
    id: '3',
    description: 'Office supplies for volunteer center',
    amount: 350,
    status: 'fulfilled',
    urgency: 'low',
    cause_area_name: 'Community',
    donor_email: 'generous.donor@example.com',
    created_at: '2024-12-10T08:00:00Z',
    claimed_at: '2024-12-10T12:00:00Z',
    fulfilled_at: '2024-12-15T16:00:00Z'
  },
  {
    id: '4',
    description: 'Tablets for senior outreach program',
    amount: 1200,
    status: 'fulfilled',
    urgency: 'medium',
    cause_area_name: 'Senior Services',
    donor_email: 'tech.donor@example.com',
    created_at: '2024-12-05T11:00:00Z',
    claimed_at: '2024-12-06T10:00:00Z',
    fulfilled_at: '2024-12-12T14:00:00Z'
  },
  {
    id: '5',
    description: 'Printer for job training center',
    amount: 450,
    status: 'open',
    urgency: 'high',
    cause_area_name: 'Employment',
    donor_email: null,
    created_at: '2024-12-21T09:00:00Z',
    claimed_at: null,
    fulfilled_at: null
  }
]

// Stats data config
const getStatsCards = (stats: CBODashboardStats) => [
  {
    title: "Total Received",
    value: `$${stats.totalReceived.toLocaleString()}`,
    change: "+18%",
    changeLabel: "This month",
  },
  {
    title: "Open Requests",
    value: stats.pendingRequests.toString(),
    change: "Awaiting donors",
    changeLabel: "Active listings",
  },
  {
    title: "In Progress",
    value: stats.activeRequests.toString(),
    change: "Claimed",
    changeLabel: "Being fulfilled",
  },
  {
    title: "Fulfilled",
    value: stats.fulfilledRequests.toString(),
    change: "+5",
    changeLabel: "This month",
  },
]

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  if (status === 'fulfilled') {
    return (
      <Badge variant="outline" className="gap-1 bg-white">
        <CheckCircle2 className="h-3 w-3 text-green-500" />
        <span className="font-semibold">Done</span>
      </Badge>
    )
  }
  if (status === 'claimed') {
    return (
      <Badge variant="outline" className="gap-1 bg-white">
        <Clock className="h-3 w-3 text-blue-500" />
        <span className="font-semibold">In Process</span>
      </Badge>
    )
  }
  if (status === 'open') {
    return (
      <Badge variant="outline" className="gap-1 bg-white">
        <Loader className="h-3 w-3 text-amber-500" />
        <span className="font-semibold">Open</span>
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 bg-white">
      <span className="font-semibold capitalize">{status}</span>
    </Badge>
  )
}

// Urgency Badge Component
function UrgencyBadge({ urgency }: { urgency: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-green-50 text-green-700 border-green-200'
  }
  return (
    <Badge variant="outline" className={colors[urgency] || 'bg-gray-50'}>
      <span className="font-semibold capitalize">{urgency}</span>
    </Badge>
  )
}

// No Organization state
function NoOrganizationState({ onSetup }: { onSetup: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-[#fafafa]">
      <div className="max-w-md text-center p-8">
        <div className="h-16 w-16 bg-[#1b5858] rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-2">Welcome to KCDD Market</h2>
        <p className="text-[#737373] mb-6">
          Set up your organization profile to start receiving donations and connecting with donors.
        </p>
        <Button 
          onClick={onSetup}
          className="bg-[#1b5858] hover:bg-[#164444] text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          Set Up Organization
        </Button>
      </div>
    </div>
  )
}

export function CBODashboard() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  
  // Data state
  const [stats, setStats] = useState<CBODashboardStats>(DEMO_STATS)
  const [requests, setRequests] = useState<RequestRecord[]>(DEMO_REQUESTS)
  const [organization, setOrganization] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(true)
  const [hasOrganization, setHasOrganization] = useState(true)

  // Filter requests
  const filteredRequests = requests.filter(r => {
    if (activeTab === 'all') return true
    return r.status === activeTab
  })

  // Fetch real data
  const fetchData = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const onboardingStatus = await checkOnboardingStatus(user.id, 'cbo')
      setNeedsOnboarding(!onboardingStatus.onboarding_complete)

      const org = await getOrganizationByUserId(user.id)
      if (org) {
        setOrganization(org)
        setHasOrganization(true)

        const [statsData, requestsData] = await Promise.all([
          fetchCBODashboardStats(user.id),
          fetchCBORequests(user.id)
        ])

        if (requestsData && requestsData.length > 0) {
          setStats(statsData)
          setRequests(requestsData)
        }
      } else {
        setHasOrganization(false)
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
    if (selectedRows.size === filteredRequests.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredRequests.map(r => r.id)))
    }
  }

  const handleSetup = () => {
    setShowOnboardingModal(true)
  }

  const handleCreateRequest = () => {
    navigate('/cbo/requests/new')
  }

  const isActive = (path: string) => location.pathname === path

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fafafa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1b5858]" />
      </div>
    )
  }

  // No organization state
  if (!loading && !hasOrganization) {
    return (
      <>
        <OnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          onComplete={() => {
            setShowOnboardingModal(false)
            setNeedsOnboarding(false)
            setHasOrganization(true)
            fetchData()
          }}
          userType="cbo"
        />
        <NoOrganizationState onSetup={handleSetup} />
      </>
    )
  }

  const statsCards = getStatsCards(stats)

  return (
    <div className="flex h-screen bg-[#fafafa]">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={() => {
          setShowOnboardingModal(false)
          setNeedsOnboarding(false)
          setHasOrganization(true)
          fetchData()
        }}
        userType="cbo"
      />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#fafafa] p-2 flex flex-col transition-all duration-300`}>
        <div className="flex-1 space-y-2">
          {/* Organization Header */}
          {organization && sidebarOpen && (
            <div className="px-2 pb-4 mb-2 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#1b5858] rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {organization.name?.[0] || 'O'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0a0a0a] truncate">{organization.name}</p>
                  <p className="text-xs text-[#737373]">Organization</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <nav className="space-y-1 p-2">
            <button 
              onClick={() => navigate('/cbo/dashboard')}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                isActive('/cbo/dashboard') 
                  ? 'bg-[#1b5858] text-white' 
                  : 'text-[#0a0a0a] hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">Dashboard</span>}
            </button>

            <button 
              onClick={() => navigate('/cbo/requests')}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                isActive('/cbo/requests') 
                  ? 'bg-[#1b5858] text-white' 
                  : 'text-[#0a0a0a] hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">My Requests</span>}
            </button>

            <button className="w-full flex items-center gap-2 px-2 py-2 text-[#0a0a0a] rounded-lg hover:bg-gray-100">
              <BarChart3 className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">Analytics</span>}
            </button>

            <button className="w-full flex items-center gap-2 px-2 py-2 text-[#0a0a0a] rounded-lg hover:bg-gray-100">
              <FileText className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">Documents</span>}
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="p-2">
            {sidebarOpen && (
              <h3 className="px-2 mb-2 text-xs font-medium text-[#0a0a0a] opacity-70">
                Quick Actions
              </h3>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={handleCreateRequest}
            >
              <Plus className="h-4 w-4 mr-2" />
              {sidebarOpen && 'New Request'}
            </Button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-2 space-y-1 border-t border-gray-200 pt-2">
          <button 
            onClick={() => setShowOnboardingModal(true)}
            className="w-full flex items-center gap-2 px-2 py-2 text-[#0a0a0a] rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-4 h-4" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
          </button>

          <button className="w-full flex items-center gap-2 px-2 py-2 text-[#0a0a0a] rounded-lg hover:bg-gray-100">
            <HelpCircle className="w-4 h-4" />
            {sidebarOpen && <span className="text-sm">Support</span>}
          </button>

          <button className="w-full flex items-center gap-2 px-2 py-2 text-[#0a0a0a] rounded-lg hover:bg-gray-100">
            <Search className="w-4 h-4" />
            {sidebarOpen && <span className="text-sm">Search</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 overflow-auto">
        <div className="bg-white rounded-[14px] shadow-sm h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 px-6 h-[49px] border-b border-[#e5e5e5]">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <div className="text-sm">Requests</div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
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
                    onClick={() => setShowOnboardingModal(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Complete Setup
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {statsCards.map((stat, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <p className="text-[#737373]">{stat.title}</p>
                      {loading ? (
                        <div className="h-9 flex items-center">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <p className="text-[30px] font-semibold leading-9">
                          {stat.value}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{stat.change}</span>
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <p className="text-sm text-[#737373]">
                        {stat.changeLabel}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Table Section */}
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="open">Open</TabsTrigger>
                    <TabsTrigger value="claimed">In Progress</TabsTrigger>
                    <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Columns2 className="h-4 w-4" />
                        <span>Customize Columns</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>Description</DropdownMenuItem>
                      <DropdownMenuItem>Cause Area</DropdownMenuItem>
                      <DropdownMenuItem>Urgency</DropdownMenuItem>
                      <DropdownMenuItem>Status</DropdownMenuItem>
                      <DropdownMenuItem>Amount</DropdownMenuItem>
                      <DropdownMenuItem>Date</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    size="sm"
                    className="bg-[#1b5858] hover:bg-[#164444]"
                    onClick={handleCreateRequest}
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Request</span>
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 16 16">
                              <circle cx="6" cy="4" r="1" fill="currentColor" />
                              <circle cx="10" cy="4" r="1" fill="currentColor" />
                              <circle cx="6" cy="8" r="1" fill="currentColor" />
                              <circle cx="10" cy="8" r="1" fill="currentColor" />
                              <circle cx="6" cy="12" r="1" fill="currentColor" />
                              <circle cx="10" cy="12" r="1" fill="currentColor" />
                            </svg>
                          </div>
                        </TableHead>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedRows.size === filteredRequests.length && filteredRequests.length > 0}
                            onCheckedChange={toggleAllRows}
                          />
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Cause Area</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 16 16">
                                <circle cx="6" cy="4" r="1" fill="currentColor" />
                                <circle cx="10" cy="4" r="1" fill="currentColor" />
                                <circle cx="6" cy="8" r="1" fill="currentColor" />
                                <circle cx="10" cy="8" r="1" fill="currentColor" />
                                <circle cx="6" cy="12" r="1" fill="currentColor" />
                                <circle cx="10" cy="12" r="1" fill="currentColor" />
                              </svg>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Checkbox 
                              checked={selectedRows.has(request.id)}
                              onCheckedChange={() => toggleRowSelection(request.id)}
                            />
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{request.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.cause_area_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <UrgencyBadge urgency={request.urgency} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={request.status} />
                          </TableCell>
                          <TableCell>${request.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {selectedRows.size} of {filteredRequests.length} row(s) selected.
                </span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span>Rows per page</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          10
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>10</DropdownMenuItem>
                        <DropdownMenuItem>20</DropdownMenuItem>
                        <DropdownMenuItem>50</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <span>Page 1 of 1</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
