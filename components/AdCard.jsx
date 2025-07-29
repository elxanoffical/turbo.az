"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { useEffect, useState } from "react";

export default function AdCard({ ad, showControls = true, isProfile = false }) {
  const router = useRouter();
  const supabase = createClient();
  const [formattedDate, setFormattedDate] = useState("");
  const [formattedPrice, setFormattedPrice] = useState("");

  useEffect(() => {
    if (ad.created_at) {
      setFormattedDate(
        format(new Date(ad.created_at), "d MMMM yyyy, HH:mm", { locale: az })
      );
    }
  }, [ad.created_at]);

  useEffect(() => {
    if (ad.price !== undefined) {
      setFormattedPrice(
        new Intl.NumberFormat("az-AZ").format(Number(ad.price))
      );
    }
  }, [ad.price]);
  const handleCardClick = () => {
    if (isProfile) {
      router.push(`/profile/${ad.id}`);
    } else {
      router.push(`/ads/${ad.id}`);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    router.push(`/profile/edit/${ad.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm("Bu elanı silmək istədiyinizə əminsiniz?")) {
      try {
        const { data: images } = await supabase
          .from("car_images")
          .select("image_url")
          .eq("car_ad_id", ad.id);

        if (images?.length > 0) {
          const filesToDelete = images.map((img) =>
            img.image_url.split("/").pop()
          );
          await supabase.storage.from("car-images").remove(filesToDelete);
        }

        const { error } = await supabase
          .from("car_ads")
          .delete()
          .eq("id", ad.id);

        if (error) throw error;

        router.refresh();
      } catch (error) {
        console.error("Silinmə xətası:", error);
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-full bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition cursor-pointer border border-[#e0FF4F]"
    >
      <div className="relative w-full h-56">
        <Image
          src={
            ad.main_image_url ||
            ad.car_images?.[0]?.image_url ||
            "/placeholder.png"
          }
          alt={`${ad.brand} ${ad.model}`}
          fill
          className="object-cover"
        />

        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton adId={ad.id} initialFavorite={ad.is_favorite} />
        </div>
      </div>

      <div className="p-3">
        <p className="text-lg font-semibold text-[#00272b]">
          {formattedPrice ? formattedPrice : "..."} AZN
        </p>
        <p className="text-sm text-gray-700 mt-1">
          {ad.brand} {ad.model}
        </p>
        <p className="text-xs text-gray-500">
          {ad.year}, {ad.engine_size} L, {ad.mileage} km
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {ad.city}, {formattedDate}
        </p>

        {showControls && isProfile && (
          <div
            className="mt-4 flex justify-between gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleEdit}
              className="text-[#00272b] border border-[#00272b] px-4 py-1 rounded hover:bg-[#e0FF4F] hover:text-black text-sm"
            >
              Redaktə
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 border border-red-600 px-4 py-1 rounded hover:bg-red-100 text-sm"
            >
              Sil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
