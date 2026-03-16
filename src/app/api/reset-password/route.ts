import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hesla se neshodují.",
    path: ["passwordConfirm"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Neplatná data." }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: parsed.data.token },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Odkaz pro změnu hesla je neplatný nebo expirovaný." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

   await prisma.user.update({
  where: { id: resetToken.userId },
  data: {
    passwordHash,
    emailVerified: new Date(),
  },
});

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return NextResponse.json(
      { error: "Změna hesla se nepodařila." },
      { status: 500 }
    );
  }
}