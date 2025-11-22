"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import type { Note } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Save, X, Trash2 } from "lucide-react"
import { formatSmartTime } from "@/lib/utils"
import Link from "next/link"

interface NoteDetailProps {
  noteId: number
}

export function NoteDetail({ noteId }: NoteDetailProps) {
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [error, setError] = useState("")

  // Edit state
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editTags, setEditTags] = useState("")

  useEffect(() => {
    fetchNote()
  }, [noteId])

  const fetchNote = async () => {
    try {
      setIsLoading(true)
      const data = await api.getNote(noteId)
      setNote(data)
      setEditTitle(data.title)
      setEditContent(data.content)
      setEditTags(data.tags.join(", "))
    } catch (err: any) {
      setError(err.message || "Failed to load note")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (note) {
      setEditTitle(note.title)
      setEditContent(note.content)
      setEditTags(note.tags.join(", "))
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!note) return

    try {
      setIsSaving(true)
      const tags = editTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const updatedNote = await api.updateNote(note.id, {
        title: editTitle,
        content: editContent,
        tags,
      })

      setNote(updatedNote)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || "Failed to save note")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!note) return

    try {
      await api.deleteNote(note.id)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to delete note")
      setShowDeleteDialog(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary shadow-lg" />
      </div>
    )
  }

  if (error && !note) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 size-4" />
              Back to Notes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!note) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.02] to-accent/[0.02]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 transition-all duration-200 hover:scale-105">
              <ArrowLeft className="size-4" />
              Back to Notes
            </Button>
          </Link>

          {!isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={handleEdit}
                size="sm"
                variant="outline"
                className="gap-2 bg-card/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 hover:scale-105"
              >
                <Edit className="size-4" />
                Edit
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                size="sm"
                className="gap-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <Card className="shadow-2xl shadow-primary/5 bg-gradient-to-br from-card to-card/95 border-border/50">
          <CardHeader className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note title"
                  className="text-2xl font-bold border-border/50 focus:border-primary transition-colors duration-200"
                  disabled={isSaving}
                />
                <Input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="Tags (comma-separated)"
                  className="border-border/50 focus:border-primary transition-colors duration-200"
                  disabled={isSaving}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={isSaving || !editTitle.trim()}
                    className="gap-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    {isSaving ? (
                      <>
                        <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                    className="gap-2 bg-card/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 hover:scale-105"
                  >
                    <X className="size-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-3xl font-bold leading-tight text-balance">{note.title}</h1>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border border-border/50 transition-all duration-200 hover:scale-105"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Created {formatDate(note.created_at)}</span>
                  <span className="text-border">•</span>
                  <span>Updated {formatSmartTime(note.updated_at)}</span>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-6">
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Note content"
                rows={15}
                className="font-mono text-sm border-border/50 focus:border-primary transition-colors duration-200"
                disabled={isSaving}
              />
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">{note.content}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
            {error}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
