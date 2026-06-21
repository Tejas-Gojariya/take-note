"use client";

import type React from "react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Star,
  Trash2,
  MoreHorizontal,
  FileText,
  Calendar,
  Tag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Note } from "@/types";
import { useNotesStore } from "@/hooks/use-notes-store";
import { cn } from "@/lib/utils";

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  onNoteSelect: (note: Note) => void;
  isLoading?: boolean;
  className?: string;
  isTrashView?: boolean;
}

export function NotesList({
  notes,
  selectedNote,
  onNoteSelect,
  isLoading = false,
  className,
  isTrashView = false,
}: NotesListProps) {
  const {
    toggleFavorite,
    deleteNote,
    permanentlyDeleteNote,
    duplicateNote,
    restoreNote,
  } = useNotesStore();
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteNote, setPendingDeleteNote] = useState<Note | null>(null);

  const handleToggleFavorite = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    toggleFavorite(noteId);
  };

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    const note = notes.find((item) => item.id === noteId) || null;
    setPendingDeleteNote(note);
    setDeleteConfirmOpen(true);
  };

  const handleDuplicateNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    duplicateNote(noteId);
  };

  const handleRestoreNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    restoreNote(noteId);
  };

  const confirmDeleteNote = async () => {
    if (!pendingDeleteNote) return;

    if (isTrashView) {
      await permanentlyDeleteNote(pendingDeleteNote.id);
    } else {
      await deleteNote(pendingDeleteNote.id);
    }

    setDeleteConfirmOpen(false);
    setPendingDeleteNote(null);
  };

  const handleDragStart = (e: React.DragEvent, note: Note) => {
    setDraggedNote(note);
    e.dataTransfer.setData("text/plain", note.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetNote: Note) => {
    e.preventDefault();
    if (draggedNote && draggedNote.id !== targetNote.id) {
      console.log("Reorder notes:", draggedNote.id, "->", targetNote.id);
    }
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-muted/10", className)}>
      <div className="p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Notes</h2>
          <Badge variant="secondary" className="text-xs">
            {notes.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p className="font-medium">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No notes found</p>
              <p className="text-sm text-muted-foreground/70">
                Create your first note to get started
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                draggable
                onDragStart={(e) => handleDragStart(e, note)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, note)}
                className={cn(
                  "w-full max-w-full overflow-hidden p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-all duration-200 group border border-transparent",
                  note.isFavorite &&
                    "bg-amber-50/80 border-amber-200/70 shadow-[0_1px_0_rgba(245,158,11,0.08)] dark:bg-amber-950/20 dark:border-amber-900/40",
                  note.isFavorite &&
                    selectedNote?.id !== note.id &&
                    "hover:bg-amber-100/70 dark:hover:bg-amber-950/30",
                  selectedNote?.id === note.id &&
                    "bg-accent border-accent-foreground/20 shadow-sm",
                  draggedNote?.id === note.id && "opacity-50"
                )}
                onClick={() => onNoteSelect(note)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="min-w-0 flex-1 truncate font-medium">
                        {note.title || "Untitled"}
                      </h3>
                    </div>

                    <p className="break-words text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {note.content?.replace(/[#*`]/g, "") || "No content"}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(note.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {note.tags && note.tags.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0 h-4"
                              >
                                {note.tags[0]}
                                {note.tags.length > 1 &&
                                  ` +${note.tags.length - 1}`}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="end"
                            className="max-w-[220px] whitespace-normal"
                          >
                            <div className="text-left text-xs leading-relaxed break-words text-primary-foreground/90">
                              {note.tags.join(", ")}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => handleToggleFavorite(e, note.id)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          note.isFavorite && "fill-yellow-400 text-yellow-400"
                        )}
                      />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isTrashView ? (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => handleRestoreNote(e, note.id)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteNote(e, note.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Permanently
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => handleDuplicateNote(e, note.id)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteNote(e, note.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) {
            setPendingDeleteNote(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {isTrashView
                ? "This will permanently delete the note. This action cannot be undone."
                : "This will delete the note and move it to Trash. You can restore it later from the Trash view."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isTrashView ? "Delete permanently" : "Delete note"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
