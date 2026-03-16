import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBlockedPeriodSchema = z.object({
  carVariantId: z.string().min(1),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createBlockedPeriodSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data formuláře." },
        { status: 400 }
      );
    }

    const dateFrom = new Date(parsed.data.dateFrom);
    const dateTo = new Date(parsed.data.dateTo);

    if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) {
      return NextResponse.json({ error: "Neplatné datum." }, { status: 400 });
    }

    if (dateFrom >= dateTo) {
      return NextResponse.json(
        { error: "Datum do musí být později než datum od." },
        { status: 400 }
      );
    }

    const blockedPeriod = await prisma.blockedPeriod.create({
      data: {
        carVariantId: parsed.data.carVariantId,
        dateFrom,
        dateTo,
        reason: parsed.data.reason || null,
      },
    });

    return NextResponse.json({ success: true, blockedPeriod });
  } catch (error) {
    console.error("ADMIN_BLOCKED_PERIOD_POST_ERROR", error);
    return NextResponse.json(
      { error: "Blokaci se nepodařilo vytvořit." },
      { status: 500 }
    );
  }
}