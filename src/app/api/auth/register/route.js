import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
      },
    }); // https://confique.api/events/imp_events
    // api -> events -> imp_events -> route.js(fetch imp_events)
    // api -> community -> route.js (fetch community posts) 
    /*
        <button onClick={() => {
            const events = await fetch('/api/events/imp_events').then(res => res.json());
          }}>
          Events
        </button> 
    */

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
