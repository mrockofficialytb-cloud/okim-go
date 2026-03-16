import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailVerificationCodeTemplate } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatný email." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Uživatel nebyl nalezen." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email je již ověřen." },
        { status: 400 }
      );
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

    await prisma.emailVerificationCode.create({
      data: {
        userId: user.id,
        email: user.email,
        code,
        expiresAt,
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Nový ověřovací kód – OKIM GO",
      html: emailVerificationCodeTemplate({
        name: user.name || user.email,
        code,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RESEND_VERIFICATION_CODE_ERROR", error);

    return NextResponse.json(
      { error: "Nový kód se nepodařilo odeslat." },
      { status: 500 }
    );
  }
}