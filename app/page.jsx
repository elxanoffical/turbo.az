import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import AdCard from "@/components/AdCard";

export default async function Home() {
  // CookieStore-u async şəkildə alırıq
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    // Yalnızca ictimai elanları gətir
    const { data: ads, error } = await supabase
      .from("car_ads")
      .select("*, car_images(image_url)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Son Elanlar</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads?.map((ad) => (
            <AdCard
              key={ad.id}
              ad={{
                ...ad,
                // Əgər car_images arrayi yoxdursa, boş array təyin et
                car_images: ad.car_images || [],
              }}
              showControls={false}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Xəta baş verdi</h1>
        <p className="text-red-500">
          Zəhmət olmasa daha sonra yenidən cəhd edin
        </p>
      </div>
    );
  }
}
