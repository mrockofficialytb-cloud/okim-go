import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const schema = z.object({
  depositAmount: z.coerce.number().int().min(0),
  depositStatus: z.enum(["UNPAID", "PAID", "RETURNED"]),
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
        { error: "Neplatná data formuláře." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Rezervace nebyla nalezena." },
        { status: 404 }
      );
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        depositAmount: parsed.data.depositAmount,
        depositStatus: parsed.data.depositStatus,
      },
    });

    return NextResponse.json({
      success: true,
      reservation: updated,
    });
  } catch (error) {
    console.error("ADMIN_RESERVATION_DEPOSIT_ERROR", error);

    return NextResponse.json(
      { error: "Uložení kauce se nepodařilo." },
      { status: 500 }
    );
  }
}