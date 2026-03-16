import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as Parameters<typeof getToken>[0]["req"], secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev" });
    const userId = typeof token?.id === "string" ? token.id : null;

    if (!userId) {
      return NextResponse.json({ preferences: null });
    }

    const preferences = await prisma.preference.findUnique({
      where: { userId },
      select: {
        riskProfile: true,
        timeHorizon: true,
        incomePreference: true,
      },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Preference API Error:", error);
    return NextResponse.json({ preferences: null }, { status: 200 });
  }
}
