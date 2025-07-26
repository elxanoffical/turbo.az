import { NextResponse } from "next/server";
import { createServerClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function middleware(request) {
  const requestUrl = new URL(request.url);
  
  try {
    const cookieStore = cookies();
    const supabaseClient = createServerClient();
    const supabase = supabaseClient(cookieStore);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;

    const pathname = requestUrl.pathname;

    // Public routes
    const publicRoutes = ["/", "/login", "/signup", /^\/[a-zA-Z0-9\-]+$/];
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user || user.app_metadata?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/add", "/edit/:path*"]
};