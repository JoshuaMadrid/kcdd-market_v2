/**
 * Donor Dashboard Page
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
  Heart,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Search,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  fetchDonorDashboardStats, 
  fetchDonorDonations,
  checkOnboardingStatus,
  type DonorDashboardStats,
  type DonationRecord
} from '@/lib/supabase'

// Demo data
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

// Stats data config
const getStatsCards = (stats: DonorDashboardStats) => [
  {
    title: "Total Donated",
    value: `$${stats.totalDonations.toLocaleString()}`,
    change: "+12%",
    changeLabel: "This month",
  },
  {
    title: "Requests Fulfilled",
    value: stats.requestsFulfilled.toString(),
    change: "+3",
    changeLabel: "This month",
  },
  {
    title: "In Progress",
    value: stats.requestsClaimed.toString(),
    change: "Active",
    changeLabel: "Awaiting completion",
  },
  {
    title: "Causes Supported",
    value: stats.causesSupported.toString(),
    change: "+1",
    changeLabel: "Different areas",
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
        <Loader className="h-3 w-3" />
        <span className="font-semibold">In Process</span>
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 bg-white">
      <span className="font-semibold capitalize">{status}</span>
    </Badge>
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
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  
  // Data state
  const [stats, setStats] = useState<DonorDashboardStats>(DEMO_STATS)
  const [donations, setDonations] = useState<DonationRecord[]>(DEMO_DONATIONS)
  const [loading, setLoading] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(true)

  // Filter donations
  const filteredDonations = donations.filter(d => {
    if (activeTab === 'all') return true
    return d.status === activeTab
  })

  // Fetch real data
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

  const isActive = (path: string) => location.pathname === path

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fafafa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1b5858]" />
      </div>
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
          fetchData()
        }}
        userType="donor"
      />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#fafafa] p-2 flex flex-col transition-all duration-300`}>
        <div className="flex-1 space-y-2">
          {/* Main Navigation */}
          <nav className="space-y-1 p-2">
            <button 
              onClick={() => navigate('/donor/dashboard')}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                isActive('/donor/dashboard') 
                  ? 'bg-[#1b5858] text-white' 
                  : 'text-[#0a0a0a] hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">My Campaign</span>}
            </button>

            <button 
              onClick={() => navigate('/requests')}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                isActive('/requests') 
                  ? 'bg-[#1b5858] text-white' 
                  : 'text-[#0a0a0a] hover:bg-gray-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">Browse Requests</span>}
            </button>

            <button 
              onClick={() => navigate('/donor/impact')}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                isActive('/donor/impact') 
                  ? 'bg-[#1b5858] text-white' 
                  : 'text-[#0a0a0a] hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">Updates & Proof</span>}
            </button>

            <button className="w-full flex items-center gap-2 px-2 py-2 text-[#0a0a0a] rounded-lg hover:bg-gray-100">
              <FileText className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">Payouts / Transfers</span>}
            </button>

            <button className="w-full flex items-center gap-2 px-2 py-2 text-[#0a0a0a] rounded-lg hover:bg-gray-100">
              <ShieldCheck className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">Verification Status</span>}
            </button>
          </nav>

          {/* Documents Section */}
          <div className="p-2">
            {sidebarOpen && (
              <h3 className="px-2 mb-2 text-xs font-medium text-[#0a0a0a] opacity-70">
                Documents
              </h3>
            )}
            <button 
              onClick={() => navigate('/donor/documents')}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                isActive('/donor/documents') 
                  ? 'bg-[#1b5858] text-white' 
                  : 'text-[#0a0a0a] hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">Tax Documents</span>}
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-2 space-y-1 border-t border-gray-200 pt-2">
          <button 
            onClick={() => setShowOnboardingModal(true)}
            className="w-full flex items-center gap-2 px-2 py-2 text-[#0a0a0a] rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-4 h-4" />
            {sidebarOpen && <span className="text-sm">Account Information</span>}
          </button>

          <button 
            onClick={() => navigate('/donor/support')}
            className="w-full flex items-center gap-2 px-2 py-2 text-[#0a0a0a] rounded-lg hover:bg-gray-100"
          >
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
            <div className="text-sm">Donations</div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Onboarding Alert */}
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
                    <TabsTrigger value="claimed">In Progress</TabsTrigger>
                    <TabsTrigger value="fulfilled">Completed</TabsTrigger>
                    <TabsTrigger value="open">Open</TabsTrigger>
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
                      <DropdownMenuItem>Organization</DropdownMenuItem>
                      <DropdownMenuItem>Cause Area</DropdownMenuItem>
                      <DropdownMenuItem>Status</DropdownMenuItem>
                      <DropdownMenuItem>Amount</DropdownMenuItem>
                      <DropdownMenuItem>Date</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="outline" size="sm" onClick={() => navigate('/requests')}>
                    <Plus className="h-4 w-4" />
                    <span>New Donation</span>
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
                            checked={selectedRows.size === filteredDonations.length && filteredDonations.length > 0}
                            onCheckedChange={toggleAllRows}
                          />
                        </TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Cause Area</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDonations.map((donation) => (
                        <TableRow key={donation.id}>
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
                              checked={selectedRows.has(donation.id)}
                              onCheckedChange={() => toggleRowSelection(donation.id)}
                            />
                          </TableCell>
                          <TableCell>{donation.organization_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{donation.cause_area_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={donation.status} />
                          </TableCell>
                          <TableCell>${donation.amount}</TableCell>
                          <TableCell>
                            {new Date(donation.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Download Receipt</DropdownMenuItem>
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
                  {selectedRows.size} of {filteredDonations.length} row(s) selected.
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
