/**
 * Donor Dashboard Page
 * Based on Figma design with sidebar navigation, stats cards, and data table
 */

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sidebar, SidebarGroup, SidebarItem, SidebarFooter } from '@/components/ui/sidebar'
import { 
  AlertTriangle, 
  Settings,
  LayoutDashboard,
  List,
  BarChart3,
  Folder,
  Users,
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
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Heart,
  DollarSign,
  Gift
} from 'lucide-react'
import { OnboardingModal } from '@/components/OnboardingModal'
import { checkOnboardingStatus } from '@/lib/supabase'

// Sample data for the donation history table
const tableData = [
  { id: 1, organization: 'Kansas City Food Bank', category: 'Food & Nutrition', status: 'completed', amount: 150, date: '2024-01-15', impact: 'Fed 30 families' },
  { id: 2, organization: 'Hope House KC', category: 'Shelter', status: 'completed', amount: 200, date: '2024-01-10', impact: 'Housing support' },
  { id: 3, organization: 'KC Youth Programs', category: 'Education', status: 'pending', amount: 75, date: '2024-01-08', impact: 'School supplies' },
  { id: 4, organization: 'Heartland Animal Rescue', category: 'Animal Welfare', status: 'completed', amount: 100, date: '2024-01-05', impact: '10 animals cared for' },
  { id: 5, organization: 'Community Health Center', category: 'Healthcare', status: 'pending', amount: 250, date: '2024-01-03', impact: 'Medical supplies' },
  { id: 6, organization: 'Midwest Veterans Support', category: 'Veterans', status: 'completed', amount: 175, date: '2023-12-28', impact: 'Veteran assistance' },
  { id: 7, organization: 'Green KC Initiative', category: 'Environment', status: 'completed', amount: 50, date: '2023-12-20', impact: '25 trees planted' },
  { id: 8, organization: 'Arts for All KC', category: 'Arts & Culture', status: 'pending', amount: 125, date: '2023-12-15', impact: 'Art supplies' },
  { id: 9, organization: 'Senior Care Network', category: 'Senior Services', status: 'completed', amount: 300, date: '2023-12-10', impact: 'Meals for 50 seniors' },
  { id: 10, organization: 'KC Tech Bridge', category: 'Technology', status: 'completed', amount: 400, date: '2023-12-05', impact: '10 laptops donated' },
]

interface StatCardProps {
  label: string
  value: string
  trend?: string
  description?: string
  icon?: React.ReactNode
}

function StatCard({ label, value, trend, description, icon }: StatCardProps) {
  return (
    <Card className="flex-1 p-6 bg-white border border-border rounded-xl shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            {icon}
          </div>
          <span className="text-3xl font-semibold text-foreground">{value}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">{trend || 'This month'}</span>
            <TrendingUp className="size-4 text-green-500" />
          </div>
          <span className="text-sm text-muted-foreground">{description || 'vs last month'}</span>
        </div>
      </div>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <Badge variant="outline" className="gap-1 bg-white">
        <CheckCircle2 className="size-3 text-green-500" />
        Completed
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 bg-white">
      <Loader2 className="size-3 animate-spin" />
      Pending
    </Badge>
  )
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="outline" className="bg-white font-semibold text-xs">
      {category}
    </Badge>
  )
}

export function DonorDashboard() {
  const { user, isLoaded } = useUser()
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10
  const totalPages = 7

  // Check onboarding status on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id) return
      
      try {
        const status = await checkOnboardingStatus(user.id)
        setOnboardingComplete(status.onboarding_complete ?? false)
        
        // Auto-show modal if onboarding not complete
        if (!status.onboarding_complete) {
          setShowOnboardingModal(true)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        setOnboardingComplete(false)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    if (isLoaded && user) {
      checkStatus()
    }
  }, [user, isLoaded])

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true)
    setShowOnboardingModal(false)
  }

  const toggleRow = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const toggleAllRows = () => {
    if (selectedRows.length === tableData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(tableData.map(row => row.id))
    }
  }

  return (
    <div className="flex h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <Sidebar className="shrink-0">
        <div className="flex flex-col h-full">
          <SidebarGroup>
            <SidebarItem 
              icon={<LayoutDashboard className="size-4" />} 
              active={activeNav === 'dashboard'}
              onClick={() => setActiveNav('dashboard')}
            >
              My Dashboard
            </SidebarItem>
            <SidebarItem 
              icon={<Heart className="size-4" />}
              active={activeNav === 'donations'}
              onClick={() => setActiveNav('donations')}
            >
              My Donations
            </SidebarItem>
            <SidebarItem 
              icon={<BarChart3 className="size-4" />}
              active={activeNav === 'impact'}
              onClick={() => setActiveNav('impact')}
            >
              Impact & Reports
            </SidebarItem>
            <SidebarItem 
              icon={<Gift className="size-4" />}
              active={activeNav === 'browse'}
              onClick={() => setActiveNav('browse')}
            >
              Browse Requests
            </SidebarItem>
            <SidebarItem 
              icon={<Users className="size-4" />}
              active={activeNav === 'organizations'}
              onClick={() => setActiveNav('organizations')}
            >
              Organizations
            </SidebarItem>
          </SidebarGroup>

          <SidebarGroup label="Documents" className="mt-4">
            <SidebarItem 
              icon={<FileText className="size-4" />}
              active={activeNav === 'tax'}
              onClick={() => setActiveNav('tax')}
            >
              Tax Documents
            </SidebarItem>
          </SidebarGroup>

          <SidebarFooter>
            <SidebarGroup>
              <SidebarItem 
                icon={<Settings className="size-4" />}
                active={activeNav === 'account'}
                onClick={() => setActiveNav('account')}
              >
                Account Settings
              </SidebarItem>
              <SidebarItem 
                icon={<HelpCircle className="size-4" />}
                active={activeNav === 'support'}
                onClick={() => setActiveNav('support')}
              >
                Support
              </SidebarItem>
              <SidebarItem 
                icon={<Search className="size-4" />}
                active={activeNav === 'search'}
                onClick={() => setActiveNav('search')}
              >
                Search
              </SidebarItem>
            </SidebarGroup>
          </SidebarFooter>
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pr-2 py-2 min-w-0">
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center h-12 px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <button className="size-7 flex items-center justify-center rounded-lg hover:bg-muted">
                <PanelLeft className="size-4" />
              </button>
              <div className="w-2 flex items-center justify-center">
                <div className="h-4 w-px bg-border" />
              </div>
              <span className="text-sm">
                Welcome back, {user?.firstName || 'Donor'}!
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {/* Onboarding Warning Banner - KEPT FROM ORIGINAL */}
            {onboardingComplete === false && !isCheckingStatus && (
              <Alert variant="destructive" className="mb-6 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Complete Your Profile</AlertTitle>
                <AlertDescription className="text-amber-700 flex items-center justify-between">
                  <span>
                    Please complete your profile setup to get started.
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowOnboardingModal(true)}
                    className="ml-4 border-amber-300 text-amber-800 hover:bg-amber-100"
                  >
                    <Settings className="size-4 mr-2" />
                    Complete Setup
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            <div className="flex gap-4 mb-6">
              <StatCard 
                label="Total Donated" 
                value="$1,825.00" 
                trend="+$425 this month" 
                description="23% increase"
                icon={<DollarSign className="size-4 text-muted-foreground" />}
              />
              <StatCard 
                label="Requests Funded" 
                value="12" 
                trend="3 this month" 
                description="Organizations helped"
                icon={<Gift className="size-4 text-muted-foreground" />}
              />
              <StatCard 
                label="Impact Score" 
                value="847" 
                trend="+125 points" 
                description="Top 15% of donors"
                icon={<Heart className="size-4 text-muted-foreground" />}
              />
              <StatCard 
                label="Tax Deductions" 
                value="$1,650" 
                trend="2024 YTD" 
                description="Eligible donations"
                icon={<FileText className="size-4 text-muted-foreground" />}
              />
            </div>

            {/* Data Table */}
            <div className="flex flex-col">
              {/* Table Filters */}
              <div className="flex items-center justify-between pb-6">
                <Tabs defaultValue="all" className="w-auto">
                  <TabsList className="bg-muted rounded-lg p-[3px] h-9">
                    <TabsTrigger value="all" className="text-sm px-2 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                      All Donations
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-sm px-2 py-1 rounded-md">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-sm px-2 py-1 rounded-md">
                      Completed
                    </TabsTrigger>
                    <TabsTrigger value="recurring" className="text-sm px-2 py-1 rounded-md">
                      Recurring
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-2">
                    <Columns2 className="size-4" />
                    <span className="text-xs">Customize Columns</span>
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-2">
                    <Plus className="size-4" />
                    <span className="text-xs">New Donation</span>
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="w-11 h-10 border-b border-border"></th>
                      <th className="w-14 h-10 border-b border-border px-3">
                        <Checkbox 
                          checked={selectedRows.length === tableData.length}
                          onCheckedChange={toggleAllRows}
                        />
                      </th>
                      <th className="h-10 border-b border-border px-2 text-left text-sm font-medium">Organization</th>
                      <th className="h-10 border-b border-border px-2 text-left text-sm font-medium">Category</th>
                      <th className="h-10 border-b border-border px-2 text-left text-sm font-medium">Status</th>
                      <th className="h-10 border-b border-border px-2 text-left text-sm font-medium">Amount</th>
                      <th className="h-10 border-b border-border px-2 text-left text-sm font-medium">Date</th>
                      <th className="h-10 border-b border-border px-2 text-left text-sm font-medium">Impact</th>
                      <th className="w-14 h-10 border-b border-border"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                        <td className="h-[53px] px-2">
                          <button className="size-8 flex items-center justify-center rounded-lg hover:bg-muted">
                            <GripVertical className="size-4 text-muted-foreground" />
                          </button>
                        </td>
                        <td className="h-[53px] px-3">
                          <Checkbox 
                            checked={selectedRows.includes(row.id)}
                            onCheckedChange={() => toggleRow(row.id)}
                          />
                        </td>
                        <td className="h-[53px] px-2 text-sm font-medium truncate max-w-[200px]">{row.organization}</td>
                        <td className="h-[53px] px-2">
                          <CategoryBadge category={row.category} />
                        </td>
                        <td className="h-[53px] px-2">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="h-[53px] px-2 text-sm font-semibold">${row.amount}</td>
                        <td className="h-[53px] px-2 text-sm text-muted-foreground">{row.date}</td>
                        <td className="h-[53px] px-2 text-sm text-muted-foreground">{row.impact}</td>
                        <td className="h-[53px] px-2">
                          <button className="size-9 flex items-center justify-center rounded-lg hover:bg-muted">
                            <MoreVertical className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} of {tableData.length * totalPages} row(s) selected.
                </span>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rows per page</span>
                    <Button variant="outline" className="h-9 w-20 gap-2 justify-between">
                      <span>{rowsPerPage}</span>
                      <ChevronDown className="size-4 opacity-50" />
                    </Button>
                  </div>

                  <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-9"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      <ChevronsLeft className="size-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-9"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-9"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-9"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      <ChevronsRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={handleOnboardingComplete}
        userType="donor"
      />
    </div>
  )
}
