"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Star,
  Trash2,
  Share,
  Users,
  Clock,
  Wifi,
  WifiOff,
  MoreHorizontal,
  Info,
  Link2,
  Eye,
  Edit3,
  PanelRightOpen,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code2,
} from "lucide-react";
import type { Note, Category } from "@/types";
import { useNotesStore } from "@/hooks/use-notes-store";
import { SimpleTagInput } from "@/components/dashboard/simple-tag-input";
import { AIToolsMenu } from "@/components/dashboard/ai-tools-menu";
import { KeyboardShortcutsDialog } from "@/components/dashboard/keyboard-shortcuts-dialog";
import { FeatureNotReadyDialog } from "@/components/dashboard/feature-not-ready-dialog";
import { CategorySelect } from "@/components/dashboard/category-select";
import { RelatedNotes } from "@/components/dashboard/related-notes";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAI } from "@/hooks/use-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { TagDisplay } from "./tag-display";
import { toast } from "sonner";

interface NoteEditorProps {
  note: Note | null;
  categories: Category[];
  onBackToList?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function NoteEditor({
  note,
  categories,
  onBackToList,
  showBackButton,
  className,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [featureDialog, setFeatureDialog] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [isOnline] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showRelatedNotes, setShowRelatedNotes] = useState(false);
  const [toolbarAction, setToolbarAction] = useState(0);
  const [showRichToolbar, setShowRichToolbar] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor">("viewer");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { updateNote, toggleFavorite, deleteNote, createCategory } =
    useNotesStore();
  const {
    summarizeText,
    rephraseText,
    translateText,
    generateTemplate,
    generateTags,
    isLoading,
  } = useAI();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setCategoryId(note.categoryId || "");
      setTags(note.tags || []);
      setHasUnsavedChanges(false);
      setLastSaved(note.updatedAt ? new Date(note.updatedAt) : null);
    }
  }, [note]);

  const handleSave = useCallback(async () => {
    if (note && hasUnsavedChanges) {
      await updateNote(note.id, {
        title: title || "Untitled",
        content,
        categoryId: categoryId || undefined,
        tags,
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    }
  }, [note, title, content, categoryId, tags, hasUnsavedChanges, updateNote]);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasUnsavedChanges && isOnline) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, handleSave, isOnline]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasUnsavedChanges(true);
  };

  const applyMarkdownWrap = (
    prefix: string,
    suffix = prefix,
    placeholder = ""
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const selectedText = content.slice(start, end);
    const nextText =
      content.slice(0, start) +
      prefix +
      (selectedText || placeholder) +
      suffix +
      content.slice(end);

    handleContentChange(nextText);
    setToolbarAction((value) => value + 1);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + (selectedText || placeholder).length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const applyMarkdownLinePrefix = (linePrefix: string, fallback = "") => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const selectedText = content.slice(start, end);
    const block = selectedText || fallback;
    const lines = block.split("\n").map((line) => `${linePrefix}${line}`);
    const nextText =
      content.slice(0, start) + lines.join("\n") + content.slice(end);

    handleContentChange(nextText);
    setToolbarAction((value) => value + 1);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + lines.join("\n").length);
    });
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setHasUnsavedChanges(true);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setHasUnsavedChanges(true);
  };

  const markdownToolbar = [
    {
      label: "Bold",
      icon: Bold,
      action: () => applyMarkdownWrap("**", "**", "bold text"),
    },
    {
      label: "Italic",
      icon: Italic,
      action: () => applyMarkdownWrap("*", "*", "italic text"),
    },
    {
      label: "H1",
      icon: Heading1,
      action: () => applyMarkdownLinePrefix("# ", "Heading 1"),
    },
    {
      label: "H2",
      icon: Heading2,
      action: () => applyMarkdownLinePrefix("## ", "Heading 2"),
    },
    {
      label: "Bullets",
      icon: List,
      action: () => applyMarkdownLinePrefix("- ", "List item"),
    },
    {
      label: "Numbered",
      icon: ListOrdered,
      action: () => applyMarkdownLinePrefix("1. ", "List item"),
    },
    {
      label: "Quote",
      icon: Quote,
      action: () => applyMarkdownLinePrefix("> ", "Quote"),
    },
    {
      label: "Code",
      icon: Code2,
      action: () => applyMarkdownWrap("`", "`", "code"),
    },
    {
      label: "Link",
      icon: Link2,
      action: () => applyMarkdownWrap("[", "](https://)", "link text"),
    },
  ];

  // AI Functions (simulated)
  const handleAISummarize = async () => {
    if (!content) return;
    const summary = await summarizeText(content, note?.id);
    if (summary) {
      handleContentChange(content + "\n\n## Summary\n" + summary);
    }
  };

  const handleAIRephrase = async (
    style: "formal" | "informal" | "concise" | "extended"
  ) => {
    if (!content) return;
    const rephrased = await rephraseText(content, style, note?.id);
    if (rephrased) {
      handleContentChange(rephrased);
    }
  };

  const handleAITranslate = async (language: string) => {
    if (!content) return;
    const translated = await translateText(content, language, note?.id);
    if (translated) {
      handleContentChange(translated);
    }
  };

  const handleGenerateTemplate = async (
    type: "meeting" | "project" | "daily" | "research"
  ) => {
    const template = await generateTemplate(type, note?.id);
    if (template) {
      handleContentChange(template);
    }
  };

  const handleTogglePreviewMode = async () => {
    if (!isPreviewMode && hasUnsavedChanges) {
      await handleSave();
    }

    setIsPreviewMode((value) => !value);
  };

  const handleGenerateTags = async () => {
    if (!content) return;
    const suggestedTags = await generateTags(content, note?.id);
    if (suggestedTags && Array.isArray(suggestedTags)) {
      const newTags = [...new Set([...tags, ...suggestedTags])];
      handleTagsChange(newTags);
    }
  };

  const handleToggleFavorite = () => {
    if (note) {
      toggleFavorite(note.id);
    }
  };

  const handleDeleteNote = () => {
    if (note) {
      setDeleteConfirmOpen(true);
    }
  };

  const confirmDeleteNote = async () => {
    if (!note) return;

    await deleteNote(note.id);
    setDeleteConfirmOpen(false);

    if (onBackToList) {
      onBackToList();
    }
  };

  const handleShareNote = async () => {
    if (!note) return;

    try {
      setShareBusy(true);
      const response = await fetch(`/api/notes/${note.id}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const data = await response.json();
      setShareUrl(data.share_url);

      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(data.share_url);
      }
    } catch {
      setFeatureDialog("share");
    } finally {
      setShareBusy(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!note) return;

    try {
      setShareBusy(true);
      const response = await fetch(`/api/notes/${note.id}/share`);

      if (!response.ok) {
        throw new Error("Failed to load share link");
      }

      const data = await response.json();
      setShareUrl(data.share_url);
      await navigator.clipboard.writeText(data.share_url);
    } catch {
      setFeatureDialog("copy link");
    } finally {
      setShareBusy(false);
    }
  };

  const handleInviteCollaborator = async () => {
    if (!note || !inviteEmail.trim()) {
      return;
    }

    try {
      setInviteBusy(true);
      const response = await fetch(`/api/notes/${note.id}/collaborator-invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite collaborator");
      }

      toast.success(`Invite created for ${data.invite.email} as ${data.invite.role}`);
      setShareUrl(data.invite.invite_url);
      setInviteEmail("");
      setInviteRole("viewer");
      setInviteOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to invite collaborator");
    } finally {
      setInviteBusy(false);
    }
  };

  const renderPreview = () => {
    return (
      <div
        className="prose prose-sm max-w-none"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        <h1 className="text-2xl font-bold mb-4">{title || "Untitled"}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {content || "No content"}
        </ReactMarkdown>
      </div>
    );
  };

  if (!note) {
    return (
      <div
        className={cn(
          "h-full flex items-center justify-center text-muted-foreground bg-muted/10",
          className
        )}
      >
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto opacity-50" />
          <div>
            <p className="font-medium">Select a note to start editing</p>
            <p className="text-sm text-muted-foreground/70">
              Choose from your notes or create a new one
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Editor Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="p-3 lg:p-4 space-y-3">
          {/* Status and Actions Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span className="hidden sm:inline">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              {lastSaved && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    Saved{" "}
                    {lastSaved.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Unsaved
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTogglePreviewMode}
                className="h-6 w-6 p-0"
              >
                {isPreviewMode ? (
                  <Edit3 className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRelatedNotes(!showRelatedNotes)}
                  className="h-6 w-6 p-0"
                >
                  <PanelRightOpen className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(true)}
                className="h-6 w-6 p-0"
              >
                <Info className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="h-6 w-6 p-0"
              >
                <Star
                  className={cn(
                    "h-3 w-3",
                    note.isFavorite && "fill-yellow-400 text-yellow-400"
                  )}
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setInviteOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Collaborate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareNote}>
                    <Share className="h-4 w-4 mr-2" />
                    {shareBusy ? "Creating link..." : "Share Note"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyShareLink}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteNote}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Title */}
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg lg:text-xl font-semibold border-0 px-0 focus-visible:ring-0 bg-transparent"
          />

          {/* Metadata and Tools */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Edit3 className="h-3 w-3" />
                <span>Markdown editor</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRichToolbar(!showRichToolbar)}
                className="h-7 px-2 text-xs"
              >
                {showRichToolbar ? "Hide tools" : "Show tools"}
              </Button>
            </div>

            {showRichToolbar && !isPreviewMode && (
              <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1">
                {markdownToolbar.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.label}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={item.action}
                      className="h-8 px-2 text-xs"
                      title={item.label}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 sm:items-center">
              <CategorySelect
                categories={categories}
                value={categoryId}
                onValueChange={handleCategoryChange}
                onCreateCategory={createCategory}
              />

              <div className="flex-1 min-w-0">
                {isPreviewMode ? (
                  <TagDisplay
                    tags={tags}
                    isPreview={true}
                    maxPreviewTags={3}
                    className="mt-1"
                  />
                ) : (
                  <SimpleTagInput
                    tags={tags}
                    onChange={handleTagsChange}
                    placeholder="Add tags..."
                  />
                )}
              </div>

              <AIToolsMenu
                onSummarize={handleAISummarize}
                onRephrase={handleAIRephrase}
                onTranslate={handleAITranslate}
                onGenerateTemplate={handleGenerateTemplate}
                onGenerateTags={handleGenerateTags}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-hidden p-4 lg:p-6">
          {isPreviewMode ? (
            <div className="h-full overflow-auto">{renderPreview()}</div>
          ) : (
            <Textarea
              ref={textareaRef}
              key={toolbarAction}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
                  e.preventDefault();
                  applyMarkdownWrap("**", "**", "bold text");
                }
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
                  e.preventDefault();
                  applyMarkdownWrap("*", "*", "italic text");
                }
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                  e.preventDefault();
                  applyMarkdownWrap("[", "](https://)", "link text");
                }
              }}
              placeholder="Start writing here..."
              className="w-full h-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed focus-visible:ring-0"
            />
          )}
        </div>

        {/* Related Notes Sidebar - Desktop only */}
        {showRelatedNotes && !isMobile && (
          <div className="min-w-0 w-64 shrink-0 border-l xl:w-72 2xl:w-80">
            <RelatedNotes noteId={note.id} content={content} />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <KeyboardShortcutsDialog
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />

      <FeatureNotReadyDialog
        open={!!featureDialog}
        onOpenChange={() => setFeatureDialog(null)}
        feature={featureDialog || ""}
      />

      {shareUrl && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border bg-background p-4 shadow-lg">
          <p className="text-sm font-medium">Share link ready</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">
            {shareUrl}
          </p>
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite collaborator</DialogTitle>
            <DialogDescription>
              Invite an existing TakeNote user by email and choose their access level.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="collaborator@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inviteRole === "viewer" ? "default" : "outline"}
                  onClick={() => setInviteRole("viewer")}
                  className="flex-1"
                >
                  Viewer
                </Button>
                <Button
                  type="button"
                  variant={inviteRole === "editor" ? "default" : "outline"}
                  onClick={() => setInviteRole("editor")}
                  className="flex-1"
                >
                  Editor
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteCollaborator} disabled={inviteBusy}>
              {inviteBusy ? "Inviting..." : "Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the note and move it to Trash. You can restore it later from the Trash view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
