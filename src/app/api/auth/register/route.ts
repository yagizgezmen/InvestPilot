import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email, // SQLite allows uniqueness on email
            }
        });

        if (existingUser) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                preferences: {
                    create: {
                        riskProfile: "Balanced",
                        timeHorizon: "2y+",
                    }
                }
            }
        });

        return NextResponse.json(user);

    } catch (error) {
        console.error("REGISTRATION_ERROR", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
