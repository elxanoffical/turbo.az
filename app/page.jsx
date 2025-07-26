import { createServerClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import AdCard from '@/components/AdCard';

export default async function Home() {
  try {
    const cookieStore = cookies();
    const supabaseClient = createServerClient();
    const supabase = supabaseClient(cookieStore);
    
    const { data: ads, error } = await supabase
      .from("car_ads")
      .select("id, brand, model, year, price, city, main_image_url")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bütün Elanlar</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads?.map((ad) => (
            <AdCard key={ad.id} ad={ad} showControls={false} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Page error:', error);
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Xəta baş verdi</h1>
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }
}