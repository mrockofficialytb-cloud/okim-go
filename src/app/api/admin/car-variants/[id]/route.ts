import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const schema = z.object({
  name: z.string().min(1, "Zadejte název varianty."),
  transmission: z.string().min(1, "Zadejte převodovku."),
  fuel: z.string().min(1, "Zadejte palivo."),
  seats: z.coerce.number().int().min(1, "Počet míst musí být alespoň 1."),
  pricePerDayShort: z.coerce.number().int().min(0),
  pricePerDayLong: z.coerce.number().int().min(0),
  quantity: z.coerce.number().int().min(1),
  image: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Neplatná data formuláře.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const variant = await prisma.carVariant.update({
      where: { id },
      data: {
        name: data.name,
        transmission: data.transmission,
        fuel: data.fuel,
        seats: data.seats,
        pricePerDayShort: data.pricePerDayShort,
        pricePerDayLong: data.pricePerDayLong,
        quantity: data.quantity,
        image: data.image?.trim() ? data.image.trim() : null,
        ...(typeof data.active === "boolean" ? { active: data.active } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      variant,
    });
  } catch (error) {
    console.error("ADMIN_CAR_VARIANT_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Úpravu varianty se nepodařilo uložit." },
      { status: 500 }
    );
  }
}