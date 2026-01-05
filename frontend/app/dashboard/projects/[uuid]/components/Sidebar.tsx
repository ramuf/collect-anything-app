'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Home, Table, Settings, FileText } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Sidebar() {
  const params = useParams()
  const pathname = usePathname()
  const projectId = params.uuid as string
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem('dashboard_sidebar_collapsed')
      setCollapsed(v === '1')
    } catch (e) {}

    function onEvent(e: Event) {
      const ce = e as CustomEvent<{ collapsed: boolean }>
      if (ce?.detail?.collapsed !== undefined) setCollapsed(ce.detail.collapsed)
    }

    window.addEventListener('dashboard:sidebar-toggle', onEvent as EventListener)
    return () => window.removeEventListener('dashboard:sidebar-toggle', onEvent as EventListener)
  }, [])

  useEffect(() => {
    const width = collapsed ? '56px' : '256px'
    try {
      document.documentElement.style.setProperty('--dashboard-sidebar-width', width)
    } catch (e) {}
  }, [collapsed])

  const navItems = [
    { id: 'forms', label: 'Forms', href: `/dashboard/projects/${projectId}`, icon: FileText },
    { id: 'views', label: 'Views', href: `/dashboard/projects/${projectId}/views`, icon: Table },
    { id: 'settings', label: 'Settings', href: `/dashboard/projects/${projectId}/settings`, icon: Settings },
  ]

  return (
    <aside
      aria-label="Sidebar"
      style={{
        background: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
        borderRightColor: 'var(--sidebar-border)',
        top: 'var(--header-height, 72px)',
        height: 'calc(100vh - var(--header-height, 72px))',
      }}
      className={`fixed left-0 z-20 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'w-14' : 'w-64'}`}
    >
      <ScrollArea className="mt-2 flex-1">
        <div className="px-2 py-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.id === 'views' && pathname.includes('/views'))
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  title={item.label}
                  className={`group flex items-center gap-3 rounded-md p-2 transition-colors ${isActive ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`truncate text-sm font-medium transition-opacity duration-200 ${collapsed ? 'opacity-0 pointer-events-none w-0' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        </div>
      </ScrollArea>
    </aside>
  )
}

