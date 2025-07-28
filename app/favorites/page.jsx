"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import AdCard from "@/components/AdCard";

export default function FavoritesPage() {
  const supabase = createClient();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("favorites")
        .select("car_ads(*)")
        .eq("user_id", user.id);

      if (data) {
        const carAds = data.map(fav => ({
          ...fav.car_ads,
          is_favorite: true,
        }));
        setAds(carAds);
      }

      setLoading(false);
    };

    fetchFavorites();
  }, []);

  if (loading) return <p>Yüklənir...</p>;

  return (
    <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {ads.length === 0 ? (
        <p>Favoritlər siyahınız boşdur.</p>
      ) : (
        ads.map(ad => (
          <AdCard key={ad.id} ad={ad} showControls={false} />
        ))
      )}
    </div>
  );
}
