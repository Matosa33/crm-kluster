'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Search,
  Settings,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

const SIDEBAR_KEY = 'sidebar-collapsed'

const navigation = [
  { name: 'Tableau de bord', href: '/tableau-de-bord', icon: LayoutDashboard },
  { name: 'Entreprises', href: '/entreprises', icon: Building2 },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Calendrier', href: '/calendrier', icon: Calendar },
  { name: 'Scraping', href: '/scraping', icon: Search },
  { name: 'Paramètres', href: '/parametres', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY)
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggle() {
    setCollapsed((prev) => {
      localStorage.setItem(SIDEBAR_KEY, String(!prev))
      return !prev
    })
  }

  return (
    <div
      className={cn(
        'hidden md:flex flex-col glass-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-4 border-b border-white/[0.06]">
        <div className="p-1.5 rounded-lg bg-primary/20 glow-indigo shrink-0">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden">
            Kluster
          </h1>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 space-y-1', collapsed ? 'p-2' : 'p-4')}>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3',
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20 glow-indigo'
                  : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Toggle button */}
      <div className={cn('p-3 border-t border-white/[0.06]', collapsed && 'flex justify-center')}>
        <button
          onClick={toggle}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors w-full"
          title={collapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
