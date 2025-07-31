"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient"; // <- buranı əlavə et
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function FavoriteButton({ adId, initialFavorite }) {
  const supabase = createClient();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const toggleFavorite = async (event) => {
    event.stopPropagation(); // klikin parent elementə yayılmasının qarşısını alır

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Giriş etməlisiniz!");

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("car_ad_id", adId);
      setIsFavorite(false);
    } else {
      await supabase
        .from("favorites")
        .insert([{ user_id: user.id, car_ad_id: adId }]);
      setIsFavorite(true);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      aria-label="Favoritə əlavə et"
      className={`p-2 rounded-full border-2 ${
        isFavorite
          ? "bg-white text-red-600 border-red-500"
          : "bg-white text-gray-400 border-white"
      } hover:text-red-500 transition cursor-pointer`}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
}
