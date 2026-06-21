import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground">
            Effective date: June 20, 2026
          </p>
        </div>

        <div className="prose prose-neutral max-w-none dark:prose-invert">
          <h2>1. Overview</h2>
          <p>
            This Privacy Policy explains what information TakeNote collects, how it is used, and how it is protected.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We may collect account details such as your name, email address, authentication data, profile settings, notes,
            tags, categories, and collaboration information you choose to create.
          </p>

          <h2>3. How We Use Information</h2>
          <p>
            We use your information to provide the app, store and sync notes, enable sharing and collaboration, personalize
            settings, and deliver AI-powered note features.
          </p>

          <h2>4. AI Features</h2>
          <p>
            When you use AI tools, the text you submit may be processed to generate summaries, tags, templates, translations,
            or related-note suggestions.
          </p>

          <h2>5. Sharing and Collaboration</h2>
          <p>
            If you create a share link or invite a collaborator, the note content and invite details may be accessible to the
            people you choose to share them with.
          </p>

          <h2>6. Storage and Security</h2>
          <p>
            We use Supabase and related infrastructure to store data and authenticate users. Access is restricted through
            row-level security and server-side checks where applicable.
          </p>

          <h2>7. Cookies and Session Data</h2>
          <p>
            We may use cookies or similar technologies to keep you signed in and maintain application sessions.
          </p>

          <h2>8. Data Retention</h2>
          <p>
            We keep your data as long as your account exists or as needed to provide the service, unless you delete it or
            request account removal where supported.
          </p>

          <h2>9. Your Choices</h2>
          <p>
            You can edit or delete your notes, revoke sharing, remove collaborators, and update your preferences from within the app.
          </p>

          <h2>10. Third-Party Services</h2>
          <p>
            TakeNote relies on third-party services such as Supabase and Google Gemini. Their own privacy policies and terms may also apply.
          </p>

          <h2>11. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact the project owner through the repository or project support channel.
          </p>
        </div>
      </div>
    </main>
  );
}
