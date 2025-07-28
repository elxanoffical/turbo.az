"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton"; // Əgər component yolundadırsa

export default function AdCard({ ad, showControls = true, isProfile = false }) {
  const router = useRouter();
  const supabase = createClient();

  // Klik hadisəsi idarəçisi
  const handleCardClick = () => {
    if (isProfile) {
      router.push(`/profile/${ad.id}`);
    } else {
      router.push(`/ads/${ad.id}`);
    }
  };

  // Redaktə et
  const handleEdit = (e) => {
    e.stopPropagation();
    router.push(`/profile/edit/${ad.id}`);
  };

  // Sil
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm("Bu elanı silmək istədiyinizə əminsiniz?")) {
      try {
        // Şəkilləri sil
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

        // Elanı sil
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
      className="border rounded cursor-pointer shadow p-3 flex flex-col transition hover:shadow-lg hover:border-blue-300"
    >
      <div className="relative h-48 w-full mb-2">
        <Image
          src={
            ad.main_image_url ||
            ad.car_images[0]?.image_url ||
            "/placeholder.png"
          }
          alt={`${ad.brand} ${ad.model}`}
          fill
          className="object-cover rounded"
          priority={false}
        />
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton adId={ad.id} initialFavorite={ad.is_favorite} />
        </div>
      </div>

      <h2 className="text-lg font-bold">
        {ad.brand} {ad.model}
      </h2>
      <p className="text-gray-600">
        {ad.year} · {ad.price} AZN
      </p>
      <p className="text-sm text-gray-500 mb-2">{ad.city}</p>

      {showControls && isProfile && (
        <div
          className="mt-auto flex justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEdit}
            className="text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 text-sm"
          >
            Redaktə
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 text-sm"
          >
            Sil
          </button>
        </div>
      )}
    </div>
  );
}
