import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  console.log("🔥 LOGOUT API HIT");

  const response = NextResponse.json({ 
    ok: true,
    message: "Logged out successfully"
  });

  // Create past date
  const expiredDate = new Date(0);
  
  // Try ALL possible domain variations
  const domains = ['localhost', '.localhost', undefined];
  const paths = ['/', '/api', '/auth', undefined];
  
  for (const domain of domains) {
    for (const path of paths) {
      // Using delete()
      response.cookies.delete("confique_token");
      
      // Using set() with expired date
      const options = {
        name: "confique_token",
        value: "",
        expires: expiredDate,
        httpOnly: true,
        secure: false, // false for localhost
        sameSite: "lax",
      };
      
      if (domain) options.domain = domain;
      if (path) options.path = path;
      
      response.cookies.set(options);
    }
  }

  return response;
}