"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { Note } from "@/lib/types"
import { NoteCard } from "./note-card"
import { NotesHeader } from "./notes-header"
import { FileText } from "lucide-react"

interface NotesGridProps {
  onCreateNote: () => void
}

export function NotesGrid({ onCreateNote }: NotesGridProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchNotes = async () => {
    try {
      setIsLoading(true)
      const data = await api.getNotes()
      setNotes(data)
    } catch (err: any) {
      setError(err.message || "Failed to load notes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  if (isLoading) {
    return (
      <>
        <NotesHeader onCreateNote={onCreateNote} />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <NotesHeader onCreateNote={onCreateNote} />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <NotesHeader onCreateNote={onCreateNote} />
      <main className="container mx-auto px-4 py-8">
        {notes.length === 0 ? (
          <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <FileText className="size-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No notes yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Get started by creating your first note. Click the "New Note" button to begin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={fetchNotes} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
