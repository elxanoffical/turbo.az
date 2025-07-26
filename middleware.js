import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function middleware(request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const pathname = request.nextUrl.pathname;

    // Public routes
    const publicRoutes = [
      "/",
      "/login",
      "/signup",
      /^\/[a-zA-Z0-9\-]+$/
    ];

    const isPublic = publicRoutes.some(route => 
      typeof route === "string" ? pathname === route : route.test(pathname)
    );

    if (isPublic) return NextResponse.next();

    // Auth check
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role check for admin routes
    if (pathname.startsWith("/admin")) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.app_metadata?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Middleware error:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/add",
    "/edit/:path*"
  ]
};