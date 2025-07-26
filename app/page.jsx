import { createServerClient } from "@/lib/supabaseServer";
import AdCard from "@/components/AdCard";

export default async function Home() {
  const supabase = await createServerClient(); 
  
  
  const { data: ads, error } = await supabase
    .from("car_ads")
    .select("id, brand, model, year, price, city, main_image_url, created_at")
    .eq("is_public", true) // Yalnız təsdiqlənmiş elanlar
    .order("created_at", { ascending: false })
    .limit(50); // İlk 50 elan

  if (error) {
    console.error("Elanlar yüklənərkən xəta:", error);
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Bütün Elanlar</h1>
        <p className="text-red-500">Elanlar yüklənərkən xəta baş verdi. Zəhmət olmasa daha sonra yenidən cəhd edin.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bütün Elanlar</h1>
        <div className="text-sm text-gray-500">
          {ads?.length || 0} elan tapıldı
        </div>
      </div>
      
      {ads?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} showControls={false} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Hələ heç bir elan yoxdur</p>
        </div>
      )}
    </div>
  );
}