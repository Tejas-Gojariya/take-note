"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";
import { NotesList } from "./notes-list";
import { NoteEditor } from "./note-editor";
import { RelatedNotesDialog } from "./related-notes-dialog";
import { useNotesStore } from "@/hooks/use-notes-store";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  user: User;
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const {
    notes,
    categories,
    selectedNote,
    selectedCategory,
    searchQuery,
    isLoading,
    setSelectedNote,
    setSelectedCategory,
    setSearchQuery,
    loadNotes,
    loadCategories,
    createCategory,
  } = useNotesStore();

  const [showRelatedDialog, setShowRelatedDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  // Load data on mount
  useEffect(() => {
    loadNotes();
    loadCategories();
  }, [loadNotes, loadCategories]);

  // Filter notes based on selected category and search query
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredNotes = notes.filter((note) => {
    const matchesCategory =
      selectedCategory === "trash"
        ? !!note.deletedAt
        : selectedCategory === "favorites"
        ? note.isFavorite && !note.deletedAt
        : selectedCategory === "all"
        ? !note.deletedAt
        : note.categoryId === selectedCategory && !note.deletedAt;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      note.title,
      note.content,
      ...(note.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }

    return (
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });

  // Auto-hide sidebar on mobile when note is selected
  useEffect(() => {
    if (isMobile && selectedNote) {
      setSidebarOpen(false);
    }
  }, [isMobile, selectedNote]);

  // Auto-show sidebar on mobile when no note is selected
  useEffect(() => {
    if (isMobile && !selectedNote) {
      setSidebarOpen(true);
    }
  }, [isMobile, selectedNote]);

  const handleNoteSelect = (note: typeof selectedNote) => {
    setSelectedNote(note);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setSelectedNote(null);
      setSidebarOpen(true);
    }
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen w-full">
        <AppSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          user={user}
          onCreateCategory={createCategory}
        />

        <SidebarInset className="flex min-h-0 flex-col">
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            user={user}
            onBackToList={handleBackToList}
            showBackButton={isMobile && !!selectedNote}
          />

          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* Notes List - Hidden on mobile when note is selected */}
            <div
              className={cn(
                "border-r bg-muted/10 transition-all duration-300 min-h-0",
                isMobile && selectedNote ? "hidden" : "flex",
                isMobile ? "flex-1" : "w-[24rem] xl:w-[26rem] 2xl:w-[28rem] shrink-0"
              )}
            >
              <NotesList
                notes={sortedNotes}
                selectedNote={selectedNote}
                onNoteSelect={handleNoteSelect}
                className="w-full"
                isLoading={isLoading}
                isTrashView={selectedCategory === "trash"}
              />
            </div>

            {/* Note Editor - Full width on mobile when note is selected */}
            <div
              className={cn(
                "flex min-w-[360px] flex-1 transition-all duration-300",
                isMobile && !selectedNote && "hidden"
              )}
            >
              <NoteEditor
                note={selectedNote}
                categories={categories}
                onBackToList={handleBackToList}
                showBackButton={isMobile}
              />
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Related Notes Dialog for mobile */}
      {selectedNote && (
        <RelatedNotesDialog
          open={showRelatedDialog}
          onOpenChange={setShowRelatedDialog}
          noteId={selectedNote.id}
          content={selectedNote.content || ""}
        />
      )}
    </SidebarProvider>
  );
}
