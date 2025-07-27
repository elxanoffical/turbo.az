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
  const [authChecked, setAuthChecked] = useState(false);

  // Auth yoxlaması
   useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          console.log('İstifadəçi tapılmadı, girişə yönləndirilir');
          router.push('/login');
        } else {
          setAuthChecked(true);
          fetchUserAds();
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      }
    };
    checkAuth();
  }, []);

  const fetchUserAds = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: ads, error } = await supabase
        .from("car_ads")
        .select("*, car_images(image_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setData({ ads, loading: false, error: null });
    } catch (error) {
      setData({ ads: [], loading: false, error: error.message });
    }
  };

  const handleDelete = async (adId) => {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;

    try {
      // Şəkilləri sil
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

      // Elanı sil
      const { error } = await supabase
        .from("car_ads")
        .delete()
        .eq("id", adId);

      if (error) throw error;

      await fetchUserAds();
    } catch (error) {
      alert(`Silinmə xətası: ${error.message}`);
    }
  };

 const handleAddNew = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.log('İstifadəçi yeni elan əlavə etmək istəyərkən doğrulanmayıb');
        throw new Error('Təsdiqlənməyib');
      }
      router.push('/add');
    } catch (error) {
      console.error('Add new ad error:', error);
      await supabase.auth.signOut();
      router.push('/login');
    }
  };


  if (!authChecked || data.loading) {
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
        <div className="flex gap-2 mt-2">
          <button
            onClick={fetchUserAds}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Yenidən yoxla
          </button>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Yenidən daxil ol
          </button>
        </div>
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
          onClick={handleAddNew}
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
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            İlk Elanınızı Yarat
          </button>
        </div>
      )}
    </div>
  );
}