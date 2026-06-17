import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Button } from "@/components/ui/button";
import { InviteAcceptButton } from "./invite-accept-button";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = createServiceClient();
  const { data: invite } = await service
    .from("note_collaborator_invites")
    .select("email, role, status, expires_at")
    .eq("token", token)
    .single();

  if (!invite) {
    redirect("/");
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-lg">
          <h1 className="text-2xl font-semibold">Invite received</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with {invite.email} to accept this invite.
          </p>
          <div className="mt-6 flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/auth/signin">Sign in</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const isMatch = user.email?.toLowerCase() === invite.email.toLowerCase();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-lg">
        <h1 className="text-2xl font-semibold">Accept collaboration invite</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You were invited as <span className="font-medium">{invite.role}</span>.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite email: {invite.email}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as: {user.email}
        </p>

        {!isMatch ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            This invite was sent to a different email address.
          </p>
        ) : (
          <div className="mt-6">
            <InviteAcceptButton token={token} />
          </div>
        )}
      </div>
    </main>
  );
}
