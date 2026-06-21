import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { createServiceClient } from "@/lib/supabase/service";

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12">
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
            Shared note
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            {note.title || "Untitled"}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Read-only view for a shared note.
          </p>
        </div>

        <article className="prose prose-invert prose-slate max-w-none rounded-2xl border border-white/10 bg-slate-950/40 p-6 shadow-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {note.content || "No content"}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
