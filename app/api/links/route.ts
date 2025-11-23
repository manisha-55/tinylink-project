import { generateCode } from "@/lib/generateCode";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { target_url, code } = await req.json();

    // 1️⃣ Validate URL
    if (!target_url || !target_url.startsWith("http")) {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    // 2️⃣ If URL already exists → return existing record (idempotent)
    const existing = await prisma.link.findFirst({
      where: { target_url }
    });

    if (existing) {
      return NextResponse.json(
        { link: existing, existing: true },
        { status: 200 }
      );
    }

    // 3️⃣ Validate custom code
    if (code) {
      const codeRegex = /^[A-Za-z0-9]{6,8}$/;
      if (!codeRegex.test(code)) {
        return NextResponse.json(
          { error: "Code must be 6–8 alphanumeric characters" },
          { status: 400 }
        );
      }

      const codeExists = await prisma.link.findUnique({
        where: { code }
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Code already exists" },
          { status: 409 }
        );
      }
    }

    // 4️⃣ Auto-generate code if not provided
    const finalCode = code || generateCode(6);

    // 5️⃣ Create link
    const newLink = await prisma.link.create({
      data: {
        target_url,
        code: finalCode,
      },
    });

    return NextResponse.json({ link: newLink }, { status: 201 });

  } catch (err) {
    console.error("POST /api/links Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(links);
}
