import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { sendEmail, emailVerificationCodeTemplate } from "@/lib/email";

const phoneRegex =
  /^(?:\+420\s?)?(?:\d{3}\s?\d{3}\s?\d{3})$/;

const registerSchema = z
  .object({
    firstName: z.string().min(2, "Zadejte jméno."),
    lastName: z.string().min(2, "Zadejte příjmení."),
    email: z.string().email("Zadejte platný email."),
    phone: z
      .string()
      .min(9, "Zadejte telefonní číslo.")
      .regex(phoneRegex, "Zadejte platné telefonní číslo."),
    password: z.string().min(8, "Heslo musí mít alespoň 8 znaků."),
    passwordConfirm: z.string().min(8, "Potvrďte heslo."),
    privacyConsent: z.boolean(),
    termsConsent: z.boolean(),
    marketingConsent: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hesla se neshodují.",
    path: ["passwordConfirm"],
  })
  .refine((data) => data.privacyConsent === true, {
    message: "Musíte souhlasit se zpracováním osobních údajů.",
    path: ["privacyConsent"],
  })
  .refine((data) => data.termsConsent === true, {
    message: "Musíte souhlasit s obchodními podmínkami.",
    path: ["termsConsent"],
  });

function normalizePhone(phone: string) {
  const digits = phone.replace(/\s+/g, "");
  if (digits.startsWith("+420")) return digits;
  if (digits.length === 9) return `+420${digits}`;
  return digits;
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Neplatná data formuláře.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      marketingConsent,
    } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Uživatel s tímto emailem už existuje." },
        { status: 400 }
      );
    }

    const usersCount = await prisma.user.count();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone: normalizePhone(phone),
        passwordHash,
        role: usersCount === 0 ? "ADMIN" : "USER",
        privacyConsentAt: now,
        termsConsentAt: now,
        marketingConsent: marketingConsent ?? false,
        emailVerified: null,
      },
    });

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
      subject: "Ověřovací kód – OKIM GO",
      html: emailVerificationCodeTemplate({
        name: user.name || user.email,
        code,
      }),
    });

    return NextResponse.json({
      success: true,
      email: user.email,
    });
  } catch (error) {
    console.error("REGISTER_API_ERROR", error);

    return NextResponse.json(
      { error: "Chyba serveru při registraci." },
      { status: 500 }
    );
  }
}