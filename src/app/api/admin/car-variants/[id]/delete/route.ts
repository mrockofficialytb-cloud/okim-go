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

    const reservationsCount = await prisma.reservation.count({
      where: {
        carVariantId: id,
      },
    });

    if (reservationsCount > 0) {
      return NextResponse.json(
        { error: "Variantu nelze smazat, protože má rezervace." },
        { status: 400 }
      );
    }

    await prisma.blockedPeriod.deleteMany({
      where: {
        carVariantId: id,
      },
    });

    await prisma.carVariant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_CAR_VARIANT_DELETE_ERROR", error);
    return NextResponse.json(
      { error: "Variantu se nepodařilo smazat." },
      { status: 500 }
    );
  }
}