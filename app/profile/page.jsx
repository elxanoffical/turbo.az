"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import AdCard from "@/components/AdCard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [data, setData] = useState({
    ads: [],
    loading: true,
    error: null
  });

  const fetchUserAds = async () => {
    try {
      // 1. Session yoxlaması
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Giriş etməmisiniz");
      }

      // 2. Elanları gətir (RLS yalnız bu istifadəçininkiləri göstərəcək)
      const { data: ads, error } = await supabase
        .from("car_ads")
        .select("*, car_images(image_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setData({ ads, loading: false, error: null });
    } catch (error) {
      setData(prev => ({ ...prev, loading: false, error: error.message }));
      if (error.message === "Giriş etməmisiniz") {
        router.push("/login");
      }
    }
  };

  const handleDelete = async (adId) => {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;

    try {
      // 1. Şəkilləri sil
      const { data: images } = await supabase
        .from("car_images")
        .select("image_url")
        .eq("car_ad_id", adId);

      if (images?.length > 0) {
        const filesToDelete = images.map(img => 
          img.image_url.split('/').pop()
        );
        await supabase.storage.from("car-images").remove(filesToDelete);
      }

      // 2. Elanı sil (RLS yalnız sahibin silməsinə icazə verəcək)
      const { error } = await supabase
        .from("car_ads")
        .delete()
        .eq("id", adId);

      if (error) throw error;

      // 3. State-dən sil
      setData(prev => ({
        ...prev,
        ads: prev.ads.filter(ad => ad.id !== adId)
      }));
    } catch (error) {
      alert(`Silinmə xətası: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchUserAds();
  }, []);

  if (data.loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
        <p>{data.error}</p>
        <button
          onClick={fetchUserAds}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
        >
          Yenidən yoxla
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          Elanlarım <span className="text-gray-500">({data.ads.length})</span>
        </h1>
        <button
          onClick={() => router.push("/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Yeni Elan +
        </button>
      </div>

      {data.ads.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.ads.map(ad => (
            <AdCard 
              key={ad.id} 
              ad={ad} 
              onDelete={handleDelete}
              onEdit={() => router.push(`/profile/edit/${ad.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">Hələ heç bir elan yaratmamısınız</p>
          <button
            onClick={() => router.push("/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            İlk Elanınızı Yarat
          </button>
        </div>
      )}
    </div>
  );
}