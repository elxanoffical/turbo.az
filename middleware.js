import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function middleware(req) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Public routes (no auth required)
  const publicRoutes = ["/", "/login", "/signup", /^\/[a-zA-Z0-9\-]+$/];

  const isPublic = publicRoutes.some((route) =>
    typeof route === "string" ? pathname === route : route.test(pathname)
  );
  if (isPublic) return NextResponse.next();

  // Not logged in
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user.app_metadata?.role || "user";

  // Block admin from accessing /profile
  if (pathname.startsWith("/profile") && role === "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Block non-admins from accessing /admin
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// ✅ /login artıq matcher-ə daxil DEYİL
export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/:id"],
};
