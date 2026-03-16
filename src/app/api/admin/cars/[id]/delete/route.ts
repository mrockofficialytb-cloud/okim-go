import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const { id } = await params;

    const variants = await prisma.carVariant.findMany({
      where: {
        carModelId: id,
      },
      select: {
        id: true,
      },
    });

    const variantIds = variants.map((v) => v.id);

    if (variantIds.length > 0) {
      // 1) smaž všechny rezervace navázané na varianty modelu
      await prisma.reservation.deleteMany({
        where: {
          carVariantId: {
            in: variantIds,
          },
        },
      });

      // 2) smaž všechny blokace navázané na varianty modelu
      await prisma.blockedPeriod.deleteMany({
        where: {
          carVariantId: {
            in: variantIds,
          },
        },
      });

      // 3) smaž všechny varianty modelu
      await prisma.carVariant.deleteMany({
        where: {
          id: {
            in: variantIds,
          },
        },
      });
    }

    // 4) smaž samotný model
    await prisma.carModel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_CAR_DELETE_ERROR", error);

    return NextResponse.json(
      {
        error: "Model se nepodařilo smazat.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}