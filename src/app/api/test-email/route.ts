import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    const result = await sendEmail({
      to: "mrockuw@seznam.cz",
      subject: "Test OKIM GO",
      html: "<h1>Email funguje</h1><p>Test odeslání emailu.</p>",
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("EMAIL_TEST_ERROR", error);

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}