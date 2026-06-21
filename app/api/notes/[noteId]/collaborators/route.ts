import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["viewer", "editor"]).default("viewer"),
});

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

    const { data: users, error: usersError } =
      await service.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 });
    }

    const targetUser = users.users.find(
      (candidate) => candidate.email?.toLowerCase() === body.email.toLowerCase()
    );

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "No Supabase user found with that email. The user must sign up first.",
        },
        { status: 404 }
      );
    }

    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: "You already own this note." },
        { status: 400 }
      );
    }

    const { data: existingCollaborator } = await service
      .from("note_collaborators")
      .select("id")
      .eq("note_id", noteId)
      .eq("user_id", targetUser.id)
      .maybeSingle();

    if (existingCollaborator) {
      return NextResponse.json(
        { error: "This user is already added to the note." },
        { status: 409 }
      );
    }

    const { error: insertError } = await service.from("note_collaborators").insert({
      note_id: noteId,
      user_id: targetUser.id,
      role: body.role,
      invited_by: user.id,
      accepted_at: new Date().toISOString(),
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      collaborator: {
        email: targetUser.email,
        role: body.role,
      },
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
