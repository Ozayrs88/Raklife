'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  ClipboardList,
  DollarSign,
  UserCog,
  BarChart3,
  ChevronDown,
  Home,
  Building2,
  TrendingUp,
  UserPlus,
  MessageCircle
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  businessName?: string
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Members',
    items: [
      { href: '/dashboard/members', label: 'Members', icon: UserPlus },
    ]
  },
  {
    label: 'Payments',
    items: [
      { href: '/dashboard/payment-recovery', label: 'Payment Recovery', icon: TrendingUp },
    ]
  },
  {
    label: 'Testing',
    items: [
      { href: '/dashboard/whatsapp-test', label: 'WhatsApp Test', icon: MessageCircle },
    ]
  },
  {
    label: 'Settings',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]
  }
]

export default function DashboardLayout({ children, businessName }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Overview', 'Members', 'Payments', 'Testing', 'Settings'])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">RAKlife Dashboard</h1>
                  {businessName && (
                    <p className="text-xs text-gray-600">{businessName}</p>
                  )}
                </div>
              </Link>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">View Site</span>
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r shadow-sm",
            "transform transition-all duration-300 ease-in-out z-40",
            sidebarCollapsed ? "w-16" : "w-64",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex items-center justify-center w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-6">
              {navGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.label)
                
                return (
                  <div key={group.label}>
                    {!sidebarCollapsed && (
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                      >
                        <span>{group.label}</span>
                        <ChevronDown 
                          className={cn(
                            "w-4 h-4 transition-transform",
                            isExpanded ? "rotate-180" : ""
                          )} 
                        />
                      </button>
                    )}
                    
                    <div className={cn(
                      "space-y-1 mt-2",
                      !isExpanded && !sidebarCollapsed && "hidden"
                    )}>
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                              isActive 
                                ? "bg-blue-50 text-blue-600 font-medium shadow-sm" 
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            )}
                            title={sidebarCollapsed ? item.label : undefined}
                          >
                            <Icon className={cn(
                              "flex-shrink-0 transition-transform group-hover:scale-110",
                              sidebarCollapsed ? "w-6 h-6" : "w-5 h-5"
                            )} />
                            {!sidebarCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                            
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                            )}
                            
                            {/* Tooltip for collapsed state */}
                            {sidebarCollapsed && (
                              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                {item.label}
                              </div>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </nav>

            {/* Sidebar Footer */}
            {!sidebarCollapsed && (
              <div className="p-4 border-t bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-xs text-gray-600 mb-2">Need help?</div>
                <Link href="/support">
                  <Button size="sm" variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          "lg:ml-0"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
