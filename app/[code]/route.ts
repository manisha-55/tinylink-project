import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    if (!code) {
      return NextResponse.json({ error: "Code missing" }, { status: 400 });
    }

    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update click count
    await prisma.link.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        last_clicked: new Date(),
      },
    });

    // ⭐ MUST use a clean redirect for Vercel
    return NextResponse.redirect(link.target_url, { status: 302 });

  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    return NextResponse.json(
      { error: "Redirect failed" },
      { status: 500 }
    );
  }
}
