import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["viewer", "editor"]).default("viewer"),
});

function buildInviteUrl(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const baseUrl = appUrl || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

  return `${baseUrl}/invite/${token}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params;
    const body = inviteSchema.parse(await request.json());

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceClient();
    const { data: note, error: noteError } = await service
      .from("notes")
      .select("id, user_id")
      .eq("id", noteId)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: authUsers, error: authError } =
      await service.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const targetUser = authUsers.users.find(
      (candidate) => candidate.email?.toLowerCase() === body.email.toLowerCase()
    );

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

    await service
      .from("note_collaborator_invites")
      .update({ status: "revoked" })
      .eq("note_id", noteId)
      .eq("email", body.email.toLowerCase())
      .eq("status", "pending");

    const { error: insertError } = await service
      .from("note_collaborator_invites")
      .insert({
        note_id: noteId,
        email: body.email.toLowerCase(),
        user_id: targetUser?.id || null,
        role: body.role,
        token,
        invited_by: user.id,
        status: "pending",
        expires_at: expiresAt,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      invite: {
        email: body.email.toLowerCase(),
        role: body.role,
        token,
        invite_url: buildInviteUrl(token),
        expires_at: expiresAt,
      },
      note: targetUser
        ? "The user already has an account. They can accept the invite link."
        : "The email is not tied to a TakeNote account yet. Share the invite link after they sign up.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
