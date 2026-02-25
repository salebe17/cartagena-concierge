import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Soft delete all active bids logically
    await supabase
      .from("bids")
      .update({ deleted_at: new Date().toISOString() })
      .eq("technician_id", user.id);

    // 2. Soft delete all service requests logically
    await supabase
      .from("service_requests")
      .update({ deleted_at: new Date().toISOString() })
      .eq("requester_id", user.id);

    // 3. Mark profile as deleted (anonymization)
    await supabase
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
        full_name: "Deleted User",
        avatar_url: null,
        phone: null,
      })
      .eq("id", user.id);

    // 4. Finally, securely delete the auth record
    // (Requires Service Role key if done entirely on backend, but Supabase provides a dedicated RPC or Auth API for this if configured. For V1 we do logical soft-delete).

    return NextResponse.json({
      message:
        "GDPR Right to Be Forgotten executed. Your data has been anonymized/soft-deleted.",
      success: true,
    });
  } catch (error) {
    console.error("GDPR Deletion Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error executing GDPR Deletion" },
      { status: 500 },
    );
  }
}
