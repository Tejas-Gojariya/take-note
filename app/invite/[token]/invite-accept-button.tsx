"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InviteAcceptButtonProps {
  token: string;
}

export function InviteAcceptButton({ token }: InviteAcceptButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collaboration-invites/${token}/accept`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invite");
      }

      toast.success("Invite accepted");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleAccept} disabled={loading} className="w-full">
      {loading ? "Accepting..." : "Accept invite"}
    </Button>
  );
}
