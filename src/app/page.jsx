import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Feed from "@/components/Feed";

export default async function HomePage() {
  const cookieStore = cookies();
 const token = cookieStore.get("confique_token")?.value;

  // ❌ Not logged in → redirect
  if (!token) {
    redirect("/auth/login");
  }

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
  } catch {
    redirect("/auth/login");
  }

  return (
    <div className="h-full w-full bg-[#0d0d0d] text-white">
      <Feed />
    </div>
  );
}
