// app/page.jsx
import { createServerClient } from "@/lib/supabaseServer";
import AdCard from "@/components/AdCard";

export default async function Home() {
  const supabase = await createServerClient();
  const { data: ads } = await supabase
    .from("car_ads")
    .select("id, brand, model, year, price, city, main_image_url")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bütün Elanlar</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} showControls={false} />
        ))}
      </div>
    </div>
  );
}
