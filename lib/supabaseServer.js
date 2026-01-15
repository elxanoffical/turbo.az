// lib/supabaseServer.js
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createServerClient = () => {
  const cookieStore = cookies();
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          const c = cookieStore || cookies();
          if (!c) return undefined;
          const cookie = typeof c.get === 'function'
            ? c.get(name)
            : Array.from(c).find(it => it?.name === name);
          return cookie?.value;
        },
        set() {},  // SSR mühitində yazmaq lazım deyil
        remove() {},
      },
    }
  );
};
