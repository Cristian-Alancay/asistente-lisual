import { NextResponse } from "next/server";
import { getLeads } from "@/lib/actions/leads";

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
