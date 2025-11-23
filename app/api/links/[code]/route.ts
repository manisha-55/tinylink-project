// app/api/links/[code]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const { code } = params;
  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(link);
}

export async function DELETE(_req: Request, { params }: { params: { code: string } }) {
  const { code } = params;
  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return NextResponse.json({ error: "not found" }, { status: 404 });
  await prisma.link.delete({ where: { code } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
