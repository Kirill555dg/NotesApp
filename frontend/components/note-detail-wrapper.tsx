"use client"

import { NoteDetail } from "@/components/note-detail"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"

export function NoteDetailWrapper({ noteId }: { noteId: number }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <AuthForm />
  }

  return <NoteDetail noteId={noteId} />
}
