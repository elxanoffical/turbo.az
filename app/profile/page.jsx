"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AdCard from "@/components/AdCard";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [ads, setAds] = useState([]);

  const fetchAds = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return router.push("/login");

    const { data, error } = await supabase
      .from("car_ads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setAds(data);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (adId) => {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;

    // Əlaqəli şəkilləri sil
    const { data: images } = await supabase
      .from("car_images")
      .select("*")
      .eq("car_ad_id", adId);

    for (const img of images) {
      const filePath = img.image_url.split("/").pop();
      await supabase.storage.from("car-images").remove([filePath]);
    }

    // Elanı sil
    const { error } = await supabase.from("car_ads").delete().eq("id", adId);
    if (!error) {
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">
          Elanlarım ({ads.length})
        </h1>
        <button
          onClick={() => router.push("/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Yeni Elan Əlavə Et
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
