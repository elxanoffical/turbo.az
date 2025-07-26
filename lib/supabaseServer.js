import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';

export const createServerClient = () => {
  return (cookieStore) => {
    return createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          // Async get metodu əlavə edirik
          async get(name) {
            try {
              return cookieStore.get(name)?.value;
            } catch (error) {
              console.error('Cookie get error:', error);
              return null;
            }
          },
          // Digər metodları da async edirik
          async set(name, value, options) {
            try {
              cookieStore.set({ name, value, ...options });
              return true;
            } catch (error) {
              console.error('Cookie set error:', error);
              return false;
            }
          },
          async remove(name, options) {
            try {
              cookieStore.set({ name, value: '', ...options });
              return true;
            } catch (error) {
              console.error('Cookie remove error:', error);
              return false;
            }
          },
        },
      }
    );
  };
};