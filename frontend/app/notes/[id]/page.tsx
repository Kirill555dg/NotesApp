"use client"

import { NoteDetailWrapper } from "@/components/note-detail-wrapper"

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const noteId = Number.parseInt(resolvedParams.id)

  return <NoteDetailWrapper noteId={noteId} />
}
