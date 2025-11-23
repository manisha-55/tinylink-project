// app/[code]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const { code } = params;

  // transaction: read, update clicks+last_clicked
  const result = await prisma.$transaction(async (tx) => {
    const link = await tx.link.findUnique({ where: { code } });
    if (!link) return null;
    const updated = await tx.link.update({
      where: { code },
      data: { clicks: { increment: 1 }, last_clicked: new Date() },
    });
    return { target_url: link.target_url, clicks: updated.clicks };
  });

  if (!result) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // explicit 302 redirect
  return NextResponse.redirect(result.target_url, 302);
}
