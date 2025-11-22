"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"
import { NotesGrid } from "@/components/notes-grid"
import { CreateNoteDialog } from "@/components/create-note-dialog"

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  if (!isAuthenticated) {
    return <AuthForm />
  }

  return (
    <>
      <NotesGrid onCreateNote={() => setShowCreateDialog(true)} />
      <CreateNoteDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
