import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const patchSchema = z.object({
  brand: z.string().min(1, "Zadejte značku."),
  model: z.string().min(1, "Zadejte model."),
  slug: z.string().min(1, "Zadejte slug."),
  active: z.boolean(),
  image: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

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
    const isAdmin = session.user.role === "ADMIN";

    const updateData: {
      active: boolean;
      brand?: string;
      model?: string;
      slug?: string;
      image?: string | null;
    } = {
      active: data.active,
    };

    if (isAdmin) {
      updateData.brand = data.brand;
      updateData.model = data.model;
      updateData.slug = data.slug;
      updateData.image = data.image?.trim() ? data.image.trim() : null;
    }

    const updated = await prisma.carModel.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      car: updated,
    });
  } catch (error) {
    console.error("ADMIN_CAR_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Došlo k chybě při ukládání." },
      { status: 500 }
    );
  }
}