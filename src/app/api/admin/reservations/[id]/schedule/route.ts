import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const schema = z.object({
  pickupTimePlanned: z.string().optional().nullable(),
  returnTimePlanned: z.string().optional().nullable(),
});

export async function PATCH(req: Request, { params }: Props) {
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
        { error: "Neplatná data formuláře." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.update({
      where: {
        id,
      },
      data: {
        pickupTimePlanned: parsed.data.pickupTimePlanned?.trim() || null,
        returnTimePlanned: parsed.data.returnTimePlanned?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      reservation,
    });
  } catch (error) {
    console.error("ADMIN_RESERVATION_SCHEDULE_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Uložení plánovaných časů se nepodařilo." },
      { status: 500 }
    );
  }
}