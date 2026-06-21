"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Github,
  Moon,
  PenLine,
  Search,
  Shield,
  Share2,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomePage() {
  const { theme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/50 dark:from-purple-950/20 dark:via-blue-950/10 dark:to-indigo-950/20" />
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-purple-300/10 blur-3xl animate-pulse-gradient" />
      <div
        className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl animate-pulse-gradient"
        style={{ animationDelay: "1s" }}
      />

      <header className="relative z-10 container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-purple-blue">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">TakeNote</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button className="btn-gradient rounded-xl px-6 py-2 font-medium text-white" asChild>
              <Link href="/auth/signin">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-20">
        <div className="mx-auto max-w-6xl space-y-20">
          <section className="mx-auto max-w-4xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100/80 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              <Sparkles className="h-4 w-4" />
              Open Source & Free Forever
            </div>

            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              <span className="gradient-text">Smart Notes</span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              A beautiful, minimal note-taking app with AI-powered features. Completely free and open source.
            </p>
          </section>

          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "AI tools", value: "6+" },
              { label: "Sharing modes", value: "2" },
              { label: "Roles", value: "2" },
              { label: "Free forever", value: "100%" },
            ].map((stat) => (
              <div key={stat.label} className="card-enhanced rounded-3xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </section>

          <section className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
            <Button
              size="lg"
              className="btn-gradient rounded-2xl px-8 py-6 text-lg font-medium text-white"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              asChild
            >
              <Link href="/auth/signin">
                Start Taking Notes
                <ArrowRight className={`ml-2 h-5 w-5 transition-transform ${isHovered ? "translate-x-1" : ""}`} />
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="rounded-2xl border-2 px-8 py-6 text-lg font-medium" asChild>
              <a href="https://github.com/Tejas-Gojariya/take-note" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </a>
            </Button>
          </section>

          <section className="space-y-6">
            <div className="space-y-3 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                What you get
              </p>
              <h2 className="text-3xl font-bold md:text-4xl">Everything in one focused workspace</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  icon: Brain,
                  title: "AI-assisted writing",
                  desc: "Summarize, rephrase, translate, and generate tags from the same editor.",
                },
                {
                  icon: Search,
                  title: "Fast search and filtering",
                  desc: "Find notes by title, content, tags, categories, favorites, or trash.",
                },
                {
                  icon: FolderKanban,
                  title: "Category organization",
                  desc: "Group notes by categories and keep everything easy to scan.",
                },
                {
                  icon: Share2,
                  title: "Sharing and invites",
                  desc: "Create public share links or invite collaborators by email.",
                },
                {
                  icon: Shield,
                  title: "Secure by default",
                  desc: "Supabase auth, row-level security, and user-scoped access control.",
                },
                {
                  icon: PenLine,
                  title: "Markdown-friendly editing",
                  desc: "Write in plain markdown with preview, shortcuts, and formatting tools.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="card-enhanced rounded-3xl p-6 text-left space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-purple-blue">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Workflow
              </p>
              <h2 className="text-3xl font-bold md:text-4xl">Move from idea to shared note without friction</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                TakeNote keeps the path simple: capture quickly, organize with categories, enrich with AI, and share when you’re ready.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  "Create a note in seconds and start writing immediately.",
                  "Use markdown tools and AI helpers to refine the content.",
                  "Share read-only links or invite collaborators when needed.",
                ].map((step, index) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-enhanced space-y-4 rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                <span>Designed for speed</span>
              </div>
              <div className="space-y-3">
                {[
                  "Keyboard-friendly editing and shortcuts",
                  "Live preview for markdown content",
                  "One-click share links",
                  "Invite-based collaboration flow",
                  "Favorites, trash, and category views",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border bg-background/60 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card-enhanced rounded-3xl p-8 space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-purple-blue">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Built for solo work and team sharing</h2>
              <p className="leading-relaxed text-muted-foreground">
                Use read-only links for simple sharing, or invite collaborators by email for viewer and editor access.
              </p>
            </div>

            <div className="card-enhanced rounded-3xl p-8 space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-purple-blue">
                <Github className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Open source and extensible</h2>
              <p className="leading-relaxed text-muted-foreground">
                The project is built with Next.js and Supabase, so it’s easy to inspect, extend, and deploy on your own stack.
              </p>
            </div>
          </section>

          <section className="card-enhanced rounded-[2rem] p-8 text-center space-y-6 md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100/80 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              <Sparkles className="h-4 w-4" />
              Ready when you are
            </div>
            <h2 className="text-3xl font-bold md:text-5xl">Start with one note and grow from there</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Capture ideas, organize them, and share them without leaving the app.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
              <Button size="lg" className="btn-gradient rounded-2xl px-8 py-6 text-lg font-medium text-white" asChild>
                <Link href="/auth/signin">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-2xl border-2 px-8 py-6 text-lg font-medium" asChild>
                <a href="https://github.com/Tejas-Gojariya/take-note" target="_blank" rel="noopener noreferrer">
                  View Source
                </a>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 container mx-auto mt-20 px-6 py-12">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-purple-blue">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold gradient-text">TakeNote</span>
          </div>
          <p className="text-muted-foreground">Built with love by the open source community</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
