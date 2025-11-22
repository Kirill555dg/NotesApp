"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { LogOut, Plus } from "lucide-react"

interface NotesHeaderProps {
  onCreateNote: () => void
}

export function NotesHeader({ onCreateNote }: NotesHeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-border/40 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none tracking-tight">Notes</h1>
            <p className="text-sm text-muted-foreground">{user?.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onCreateNote}
            size="sm"
            className="gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Note</span>
          </Button>
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="gap-2 transition-all duration-200 hover:scale-105"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
