"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AdCard from "@/components/AdCard";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. İlk öncə session yoxlaması (sürətli yoxlama)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 2. Elanları yüklə
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: adsData, error: adsError } = await supabase
          .from("car_ads")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (adsError) throw adsError;

        setAds(adsData || []);
      } catch (err) {
        console.error("Profile error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (adId) => {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;

    try {
      // Şəkilləri sil
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
      if (error) throw error;

      setAds(prev => prev.filter(ad => ad.id !== adId));
    } catch (err) {
      alert("Silinmə xətası: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold">Yüklənir...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-red-500">{error}</h1>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Yenidən yoxla
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Elanlarım ({ads.length})</h1>
        <button
          onClick={() => router.push("/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Yeni Elan Əlavə Et
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <AdCard 
            key={ad.id} 
            ad={ad} 
            onDelete={handleDelete} 
          />
        ))}
      </div>

      {ads.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Hələ heç bir elan əlavə etməmisiniz</p>
          <button
            onClick={() => router.push("/add")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            İlk Elanınızı Əlavə Edin
          </button>
        </div>
      )}
    </div>
  );
}