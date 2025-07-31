"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import AdCard from "@/components/AdCard";

export default function FavoritesPage() {
  const supabase = createClient();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("car_ads(*)")
        .eq("user_id", user.id);

      if (data && isMounted) {
        const carAds = data.map(fav => ({
          ...fav.car_ads,
          is_favorite: true,
        }));
        setAds(carAds);
      }

      if (isMounted) setLoading(false);
    };

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Yüklənir...</p>
      </div>
    );

  if (!loading && ads.length === 0)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Favoritlər siyahınız boşdur.</p>
      </div>
    );

  return (
    <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {ads.map(ad => (
        <AdCard key={ad.id} ad={ad} showControls={false} />
      ))}
    </div>
  );
}
