import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createVariantSchema = z.object({
  carModelId: z.string().min(1),
  name: z.string().min(1),
  transmission: z.string().min(1),
  fuel: z.string().min(1),
  seats: z.coerce.number().int().min(1),
  pricePerDayShort: z.coerce.number().int().min(0),
  pricePerDayLong: z.coerce.number().int().min(0),
  quantity: z.coerce.number().int().min(1),
  image: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createVariantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Neplatná data formuláře.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const variant = await prisma.carVariant.create({
      data: {
        carModelId: parsed.data.carModelId,
        name: parsed.data.name,
        transmission: parsed.data.transmission,
        fuel: parsed.data.fuel,
        seats: parsed.data.seats,
        pricePerDayShort: parsed.data.pricePerDayShort,
        pricePerDayLong: parsed.data.pricePerDayLong,
        quantity: parsed.data.quantity,
        image: parsed.data.image?.trim() ? parsed.data.image.trim() : null,
        active: parsed.data.active ?? true,
      },
    });

    return NextResponse.json({ success: true, variant });
  } catch (error) {
    console.error("ADMIN_CAR_VARIANTS_POST_ERROR", error);
    return NextResponse.json(
      { error: "Vytvoření varianty se nepodařilo." },
      { status: 500 }
    );
  }
}