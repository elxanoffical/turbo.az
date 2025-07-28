import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import AdCard from "@/components/AdCard";
import FilterBar from "@/components/FilterBar";

export default async function Home({ searchParams }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const query = supabase
      .from("car_ads")
      .select(
        `
        *,
        car_images(image_url),
        favorites(user_id)
      `
      )
      .eq("is_public", true);

    // Filters from query params
    const {
      brand,
      model,
      city,
      new: isNew,
      barter,
      body,
      price_min,
      price_max,
      year_min,
      year_max,
    } = searchParams;

    if (brand) query.ilike("brand", `%${brand}%`);
    if (model) query.ilike("model", `%${model}%`);
    if (city) query.ilike("city", `%${city}%`);
    if (body) query.eq("body", body);
    if (isNew === "true") query.eq("new", true);
    if (isNew === "false") query.eq("new", false);
    if (barter === "true") query.eq("barter", true);
    if (price_min) query.gte("price", Number(price_min));
    if (price_max) query.lte("price", Number(price_max));
    if (year_min) query.gte("year", Number(year_min));
    if (year_max) query.lte("year", Number(year_max));

    const { data: ads, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <FilterBar />
        <h1 className="text-3xl font-bold mb-6">Son Elanlar</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads?.map((ad) => {
            const isFavorite = user
              ? ad.favorites.some((fav) => fav.user_id === user.id)
              : false;

            return (
              <AdCard
                key={ad.id}
                ad={{
                  ...ad,
                  car_images: ad.car_images || [],
                  is_favorite: isFavorite,
                }}
                showControls={false}
              />
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Xəta baş verdi</h1>
        <p className="text-red-500">Zəhmət olmasa daha sonra yenidən cəhd edin</p>
      </div>
    );
  }
}
