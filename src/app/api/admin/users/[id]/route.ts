import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const noteSchema = z.object({
  note: z.string().trim().min(1, "Zadejte text poznámky."),
});

export async function POST(req: Request, { params }: Props) {
  const session = await auth();

  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data formuláře." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Uživatel nebyl nalezen." },
        { status: 404 }
      );
    }

    const createdNote = await prisma.userAdminNote.create({
      data: {
        userId: id,
        note: parsed.data.note,
      },
    });

    return NextResponse.json({
      success: true,
      note: createdNote,
    });
  } catch (error) {
    console.error("ADMIN_USER_NOTE_CREATE_ERROR", error);

    return NextResponse.json(
      {
        error: "Uložení poznámky se nepodařilo.",
        details: error instanceof Error ? error.message : "Neznámá chyba",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Nemůžete odstranit sami sebe." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Uživatel nebyl nalezen." },
        { status: 404 }
      );
    }

    if (user._count.reservations > 0) {
      return NextResponse.json(
        { error: "Uživatele nelze odstranit, protože má rezervace." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.userAdminNote.deleteMany({
        where: { userId: id },
      });

      await tx.passwordResetToken.deleteMany({
        where: { userId: id },
      });

      await tx.emailVerificationCode.deleteMany({
        where: { userId: id },
      });

      await tx.session.deleteMany({
        where: { userId: id },
      });

      await tx.account.deleteMany({
        where: { userId: id },
      });

      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_USER_DELETE_ERROR", error);

    return NextResponse.json(
      {
        error: "Odstranění uživatele se nepodařilo.",
        details: error instanceof Error ? error.message : "Neznámá chyba",
      },
      { status: 500 }
    );
  }
}