// middleware.js
import { createServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const publicRoutes = ["/", "/login", "/signup"];
const protectedRoutes = ["/profile", "/add", "/admin"];

export async function middleware(request) {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname;
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublic = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublic) {
    return NextResponse.next();
  }

  if (isProtected) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Admin `/admin` və `/add`-ə, user `/add` və `/profile`-ə girə bilər
    if (
      pathname.startsWith("/admin") &&
      user.user_metadata.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/add", "/admin/:path*"],
};
