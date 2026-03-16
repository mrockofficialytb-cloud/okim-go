import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCarSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createCarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data formuláře." },
        { status: 400 }
      );
    }

    const existing = await prisma.carModel.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Model s tímto slugem už existuje." },
        { status: 400 }
      );
    }

    const car = await prisma.carModel.create({
      data: {
        brand: parsed.data.brand,
        model: parsed.data.model,
        slug: parsed.data.slug,
        image: parsed.data.image || null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, car });
  } catch (error) {
    console.error("ADMIN_CARS_POST_ERROR", error);
    return NextResponse.json(
      { error: "Vytvoření modelu se nepodařilo." },
      { status: 500 }
    );
  }
}