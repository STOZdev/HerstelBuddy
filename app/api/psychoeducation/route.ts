import { NextRequest, NextResponse } from "next/server";
import { psychoeducationSeed } from "@/app/psychoeducationSeed";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.has("admin")) {
    return NextResponse.json({ error: "Beheer is niet geactiveerd in deze mock." }, { status: 403 });
  }
  return NextResponse.json({ items: psychoeducationSeed });
}

export function POST() {
  return NextResponse.json({ error: "Beheer is niet geactiveerd in deze mock." }, { status: 403 });
}
