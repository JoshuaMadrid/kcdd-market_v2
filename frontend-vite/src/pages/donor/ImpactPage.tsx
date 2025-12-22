/**
 * Donor Impact Report Page
 */

import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sidebar, SidebarGroup, SidebarItem, SidebarFooter } from '@/components/ui/sidebar'
import { 
  Settings,
  LayoutDashboard,
  Heart,
  BarChart3,
  FileText,
  HelpCircle,
  PanelLeft,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Award,
  Target,
  Loader2
} from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

// Demo impact data
const DEMO_IMPACT = {
  totalDonated: 2847,
  livesImpacted: 24,
  organizationsHelped: 8,
  monthsActive: 6,
  topCauses: [
    { name: 'Education', amount: 1200, percentage: 42 },
    { name: 'Digital Access', amount: 680, percentage: 24 },
    { name: 'Senior Services', amount: 520, percentage: 18 },
    { name: 'Employment', amount: 447, percentage: 16 }
  ],
  monthlyData: [
    { month: 'Jul', amount: 250 },
    { month: 'Aug', amount: 480 },
    { month: 'Sep', amount: 320 },
    { month: 'Oct', amount: 650 },
    { month: 'Nov', amount: 520 },
    { month: 'Dec', amount: 627 }
  ],
  recentImpact: [
    { description: 'Helped a student access remote learning', date: '2024-12-18', organization: 'KC Youth Education' },
    { description: 'Connected a family to the internet', date: '2024-12-12', organization: 'Digital Bridge KC' },
    { description: 'Enabled job interview preparation', date: '2024-12-09', organization: 'Employment First KC' },
    { description: 'Supported small business operations', date: '2024-12-07', organization: 'Entrepreneurship Hub' }
  ]
}

export function DonorImpact() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const isActive = (path: string) => location.pathname === path

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
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
            onClick={() => navigate('/donor/dashboard')}
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
              {user?.firstName?.[0] || 'D'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName || 'Demo User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.emailAddresses?.[0]?.emailAddress || 'demo@example.com'}</p>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="h-8 w-8 p-0">
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div>
                <nav className="flex items-center gap-2 text-sm text-gray-500">
                  <Link to="/" className="hover:text-gray-700">Home</Link>
                  <span>/</span>
                  <Link to="/donor/dashboard" className="hover:text-gray-700">Dashboard</Link>
                  <span>/</span>
                  <span className="text-gray-900">Impact Report</span>
                </nav>
                <h1 className="text-xl font-semibold text-gray-900 mt-1">Your Impact</h1>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 6 months
            </Button>
          </div>
        </header>

        <main className="p-6">
          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-700 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm opacity-80">Total Donated</span>
              </div>
              <p className="text-3xl font-bold">${DEMO_IMPACT.totalDonated.toLocaleString()}</p>
            </Card>
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500">Lives Impacted</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{DEMO_IMPACT.livesImpacted}</p>
            </Card>
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500">Organizations Helped</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{DEMO_IMPACT.organizationsHelped}</p>
            </Card>
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500">Months Active</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{DEMO_IMPACT.monthsActive}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Chart */}
            <Card className="lg:col-span-2 p-6 bg-white border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h2>
              <div className="flex items-end gap-4 h-48">
                {DEMO_IMPACT.monthlyData.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gray-900 rounded-t"
                      style={{ height: `${(item.amount / 700) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500">{item.month}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Causes */}
            <Card className="p-6 bg-white border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Causes</h2>
              <div className="space-y-4">
                {DEMO_IMPACT.topCauses.map((cause, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{cause.name}</span>
                      <span className="text-gray-500">${cause.amount}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-900 rounded-full"
                        style={{ width: `${cause.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Impact */}
          <Card className="mt-6 p-6 bg-white border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Impact Stories</h2>
            <div className="space-y-4">
              {DEMO_IMPACT.recentImpact.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-500">{item.organization} • {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Fulfilled</Badge>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

