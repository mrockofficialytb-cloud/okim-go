import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  addressStreet: z.string().max(200).optional().nullable(),
  addressCity: z.string().max(100).optional().nullable(),
  addressZip: z.string().max(20).optional().nullable(),
  idDocumentNumber: z.string().max(100).optional().nullable(),
  driverLicenseNumber: z.string().max(100).optional().nullable(),
  driverLicenseExpiry: z.string().optional().nullable(),
});

function toNullableString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toNullableDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Musíte být přihlášen." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data formuláře." },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const firstName = toNullableString(data.firstName);
    const lastName = toNullableString(data.lastName);

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName,
        lastName,
        name: [firstName, lastName].filter(Boolean).join(" ") || null,
        dateOfBirth: toNullableDate(data.dateOfBirth),
        addressStreet: toNullableString(data.addressStreet),
        addressCity: toNullableString(data.addressCity),
        addressZip: toNullableString(data.addressZip),
        idDocumentNumber: toNullableString(data.idDocumentNumber),
        driverLicenseNumber: toNullableString(data.driverLicenseNumber),
        driverLicenseExpiry: toNullableDate(data.driverLicenseExpiry),
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("ACCOUNT_DETAILS_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Uložení údajů se nepodařilo." },
      { status: 500 }
    );
  }
}