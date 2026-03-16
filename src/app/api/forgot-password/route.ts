import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, resetPasswordTemplate } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Neplatný email." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    // bezpečně vrací stejné hlášení i když účet neexistuje
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.APP_URL}/reset-hesla?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Obnova hesla – OKIM GO",
      html: resetPasswordTemplate({
        name: user.name || user.email,
        resetUrl,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return NextResponse.json(
      { error: "Odeslání emailu se nepodařilo." },
      { status: 500 }
    );
  }
}