/**
 * Main Layout Component
 * 
 * Provides consistent header/footer across pages
 */

import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ for KC Digital Drive. Making Kansas City a digital leader.
          </p>
        </div>
      </footer>
    </div>
  )
}

