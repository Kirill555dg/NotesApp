"use client"

import { use } from "react"
import { NoteDetail } from "@/components/note-detail"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated } = useAuth()
  const resolvedParams = use(params)
  const noteId = Number.parseInt(resolvedParams.id)

  if (!isAuthenticated) {
    return <AuthForm />
  }

  return <NoteDetail noteId={noteId} />
}
