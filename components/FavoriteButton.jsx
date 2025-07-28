import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function FavoriteButton({ adId, initialFavorite }) {
  const supabase = createClient();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const toggleFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Giriş etməlisiniz!");

    if (isFavorite) {
      // Favoritdən çıxar
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("car_ad_id", adId);
      setIsFavorite(false);
    } else {
      // Favoritə əlavə et
      await supabase
        .from("favorites")
        .insert([{ user_id: user.id, car_ad_id: adId }]);
      setIsFavorite(true);
    }
  };

  return (
    <button onClick={toggleFavorite} aria-label="Favoritə əlavə et">
      {isFavorite ? "★" : "☆"}
    </button>
  );
}
