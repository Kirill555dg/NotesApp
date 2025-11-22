"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateNoteDialog({ open, onOpenChange }: CreateNoteDialogProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    try {
      setIsCreating(true)
      setError("")

      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const newNote = await api.createNote({
        title: title.trim(),
        content: content.trim(),
        tags: tagArray,
      })

      // Reset form
      setTitle("")
      setContent("")
      setTags("")
      onOpenChange(false)

      // Navigate to the new note
      router.push(`/notes/${newNote.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to create note")
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setTitle("")
      setContent("")
      setTags("")
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Note</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new note to your collection. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreating}
              autoFocus
              className="border-border/50 focus:border-primary transition-colors duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter note content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isCreating}
              rows={8}
              className="font-mono text-sm border-border/50 focus:border-primary transition-colors duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isCreating}
              className="border-border/50 focus:border-primary transition-colors duration-200"
            />
            <p className="text-xs text-muted-foreground">Example: work, personal, ideas</p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-destructive/20">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
            className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
            className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Creating...
              </div>
            ) : (
              "Create Note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
