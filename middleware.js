import { createServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const publicRoutes = ["/", "/login", "/signup", "/about", "/contact"];
const authRoutes = ["/profile", "/add", "/favorites"];
const adminRoutes = ["/admin"];

export async function middleware(request) {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname;
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    // 1. Session yoxlaması (sürətli)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // 2. Public yollar üçün yoxlama
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // 3. Auth tələb edən yollar
    if (authRoutes.some(route => pathname.startsWith(route))) {
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.next();
    }

    // 4. Admin yolları üçün ətraflı yoxlama
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // User və rol yoxlaması
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user || user.app_metadata?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    }

    // 5. Dinamik yollar (/ilan/[id] kimi)
    if (pathname.startsWith('/ilan')) {
      if (!session) {
        // Qonaqlar yalnız ictimai elanları görə bilər
        const id = pathname.split('/').pop();
        const { data: ad } = await supabase
          .from("car_ads")
          .select("is_public")
          .eq("id", id)
          .single();

        if (!ad?.is_public) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/admin/:path*',
    '/add',
    '/ilan/:path*',
    '/favorites'
  ]
};