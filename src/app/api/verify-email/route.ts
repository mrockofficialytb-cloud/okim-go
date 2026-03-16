import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data." },
        { status: 400 }
      );
    }

    const { email, code } = parsed.data;

    const record = await prisma.emailVerificationCode.findFirst({
      where: {
        email,
        code,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Neplatný nebo expirovaný ověřovací kód." },
        { status: 400 }
      );
    }

    await prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: {
        usedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("VERIFY_EMAIL_ERROR", error);

    return NextResponse.json(
      { error: "Ověření emailu se nepodařilo." },
      { status: 500 }
    );
  }
}