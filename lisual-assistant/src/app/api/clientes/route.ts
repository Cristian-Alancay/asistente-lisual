import { NextResponse } from "next/server";
import { getClientes } from "@/lib/actions/operaciones";

export async function GET() {
  try {
    const clientes = await getClientes();
    return NextResponse.json(clientes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
