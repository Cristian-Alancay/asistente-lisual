import { NextResponse } from "next/server";
import { getProyectos } from "@/lib/actions/operaciones";

export async function GET() {
  try {
    const proyectos = await getProyectos();
    return NextResponse.json(proyectos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
