import { NextResponse } from "next/server";
import { getAvailableCars } from "@/lib/availability";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const dateFrom = new Date(body.dateFrom);
    const dateTo = new Date(body.dateTo);

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: "Invalid dates" },
        { status: 400 }
      );
    }

    const cars = await getAvailableCars(dateFrom, dateTo);

    return NextResponse.json(cars);
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}