import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-muted-foreground">
            Effective date: June 20, 2026
          </p>
        </div>

        <div className="prose prose-neutral max-w-none dark:prose-invert">
          <h2>1. Acceptance</h2>
          <p>
            By using TakeNote, you agree to these Terms. If you do not agree, please do not use the service.
          </p>

          <h2>2. The Service</h2>
          <p>
            TakeNote is a note-taking application that provides note creation, markdown editing, search, AI-assisted features,
            sharing, and collaboration tools.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the security of your account and for all activity under your account.
            You should keep your credentials private and sign out when using shared devices.
          </p>

          <h2>4. Your Content</h2>
          <p>
            You retain ownership of the notes and content you create. You are responsible for making sure your content does
            not violate applicable laws or the rights of others.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>
            You agree not to misuse the service, attempt unauthorized access, interfere with the app, or use it to
            distribute harmful, illegal, or abusive content.
          </p>

          <h2>6. Sharing and Collaboration</h2>
          <p>
            Shared links and collaborator invites are meant for the people you choose to share with. You are responsible
            for reviewing what you share and with whom you share it.
          </p>

          <h2>7. Service Changes</h2>
          <p>
            We may update, modify, or discontinue features at any time. We will try to keep the experience stable, but
            some features may change as the product evolves.
          </p>

          <h2>8. Termination</h2>
          <p>
            We may suspend or terminate access if the service is misused or if required for security, legal, or operational reasons.
          </p>

          <h2>9. Disclaimer</h2>
          <p>
            TakeNote is provided on an as-is and as-available basis. We do not guarantee uninterrupted service or that all features
            will always be available without errors.
          </p>

          <h2>10. Contact</h2>
          <p>
            If you have questions about these Terms, please contact the project owner through the repository or project support channel.
          </p>
        </div>
      </div>
    </main>
  );
}
