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
  active: z.boolean(),
  brand: z.string().min(1, "Zadejte značku.").optional(),
  model: z.string().min(1, "Zadejte model.").optional(),
  slug: z.string().min(1, "Zadejte slug.").optional(),
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
      if (typeof data.brand === "string") {
        updateData.brand = data.brand;
      }

      if (typeof data.model === "string") {
        updateData.model = data.model;
      }

      if (typeof data.slug === "string") {
        updateData.slug = data.slug;
      }

      if ("image" in data) {
        updateData.image = data.image?.trim() ? data.image.trim() : null;
      }
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