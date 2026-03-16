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
    return NextResponse.json(
      { error: "Nemáte oprávnění." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    await prisma.userAdminNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_USER_NOTE_DELETE_ERROR", error);

    return NextResponse.json(
      { error: "Poznámku se nepodařilo smazat." },
      { status: 500 }
    );
  }
}