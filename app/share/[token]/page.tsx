import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { createServiceClient } from "@/lib/supabase/service";
import { CalendarDays, FileText, ShieldCheck } from "lucide-react";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const service = createServiceClient();

  const { data: note } = await service
    .from("notes")
    .select("title, content, shared_at")
    .eq("share_token", token)
    .single();

  if (!note) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[35vh] bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute -top-24 right-[-6rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-[-6rem] h-72 w-72 rounded-full bg-muted/50 blur-3xl dark:bg-primary/10" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-card/80 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Shared note
            </div>
          </div>

          <div className="grid gap-4 px-5 py-6 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {note.title || "Untitled"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Read-only shared document. Clean, distraction-free, and ready to read.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 shadow-sm">
                <FileText className="h-3.5 w-3.5" />
                Markdown enabled
              </div>
              {note.shared_at && (
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 shadow-sm">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Shared {new Date(note.shared_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <article className="mx-auto w-full max-w-4xl rounded-3xl border border-border bg-card/85 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:p-8">
          <div className="prose max-w-none prose-headings:tracking-tight prose-p:leading-7 prose-pre:rounded-2xl prose-pre:border prose-pre:border-border prose-pre:bg-muted prose-pre:p-4 prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {note.content || "No content"}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  );
}
