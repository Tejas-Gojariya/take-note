import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceClient();
    const { data: invite, error } = await service
      .from("note_collaborator_invites")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      await service
        .from("note_collaborator_invites")
        .update({ status: "expired" })
        .eq("id", invite.id);
      return NextResponse.json({ error: "Invite expired" }, { status: 410 });
    }

    if (invite.email.toLowerCase() !== (user.email || "").toLowerCase()) {
      return NextResponse.json({ error: "This invite was sent to a different email" }, { status: 403 });
    }

    const { data: existingCollaborator } = await service
      .from("note_collaborators")
      .select("id")
      .eq("note_id", invite.note_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCollaborator) {
      const { error: updateError } = await service
        .from("note_collaborators")
        .update({
          role: invite.role,
          invited_by: invite.invited_by,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", existingCollaborator.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    } else {
      const { error: insertError } = await service.from("note_collaborators").insert({
        note_id: invite.note_id,
        user_id: user.id,
        role: invite.role,
        invited_by: invite.invited_by,
        accepted_at: new Date().toISOString(),
      });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }
    }

    await service
      .from("note_collaborator_invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        user_id: user.id,
      })
      .eq("id", invite.id);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
