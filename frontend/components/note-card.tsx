"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import type { Note } from "@/lib/types"
import { formatSmartTime } from "@/lib/utils"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { api } from "@/lib/api"

interface NoteCardProps {
  note: Note
  onDelete?: () => void
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const truncateContent = (content: string, maxLength = 120) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + "..."
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsDeleting(true)
      await api.deleteNote(note.id)
      setShowDeleteDialog(false)
      onDelete?.()
    } catch (error) {
      console.error("Failed to delete note:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  return (
    <>
      <Link href={`/notes/${note.id}`} className="block h-full">
        <Card className="group relative h-[300px] transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {note.title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-3 flex-1 overflow-hidden">
            <p className="text-sm text-muted-foreground line-clamp-4">{truncateContent(note.content)}</p>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 pt-3 border-t flex-shrink-0">
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 w-full">
                {note.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{note.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{formatSmartTime(note.updated_at)}</p>
          </CardFooter>
        </Card>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{note.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
