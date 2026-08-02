import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { getProfileData } from "@/lib/profile/get-profile-data";

/** Admin-only normalized ProfileData for QA — not for GitHub README. */
export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const data = await getProfileData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load profile data" },
      { status: 500, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
