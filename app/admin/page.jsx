"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AdCard from "@/components/AdCard";

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Elanları yenilə
  const refreshAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("car_ads")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setAds(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Elan təsdiqlə
  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from("car_ads")
        .update({ is_public: true })
        .eq("id", id);

      if (error) throw error;
      refreshAds();
    } catch (err) {
      alert("Təsdiqləmə xətası: " + err.message);
    }
  };

  // Elan sil
  const handleDelete = async (id) => {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;

    try {
      // Şəkilləri sil
      const { data: images } = await supabase
        .from("car_images")
        .select("*")
        .eq("car_ad_id", id);

      const filesToDelete = images.map(img => 
        img.image_url.split('/').pop()
      );

      if (filesToDelete.length > 0) {
        await supabase.storage.from("car-images").remove(filesToDelete);
      }

      // Elanı sil
      const { error } = await supabase.from("car_ads").delete().eq("id", id);
      if (error) throw error;

      setAds(prev => prev.filter(ad => ad.id !== id));
    } catch (err) {
      alert("Silinmə xətası: " + err.message);
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // 1. İLK YOXLAMA - Session (sürətli)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return false;
        }

        // 2. İKİNCİ YOXLAMA - User details (dəqiq)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user || user.app_metadata?.role !== 'admin') {
          router.push('/');
          return false;
        }

        return true;
      } catch (err) {
        console.error("Auth check error:", err);
        return false;
      }
    };

    const loadData = async () => {
      const isAdmin = await checkAdminAccess();
      if (!isAdmin) return;

      setAuthChecked(true);
      try {
        await refreshAds();
      } catch (err) {
        setError(err.message);
      }
    };

    loadData();
  }, []);

  if (!authChecked || loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Xəta baş verdi</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Yenidən yoxla
        </button>
      </div>
    );
  }

  const pendingAds = ads.filter(ad => !ad.is_public);
  const approvedAds = ads.filter(ad => ad.is_public);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <button
          onClick={refreshAds}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Yenilə
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Təsdiq gözləyənlər */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Təsdiq Gözləyənlər ({pendingAds.length})</h2>
          </div>
          
          {pendingAds.length > 0 ? (
            <div className="space-y-4">
              {pendingAds.map(ad => (
                <div key={ad.id} className="border rounded-lg overflow-hidden bg-yellow-50">
                  <AdCard ad={ad} showControls={false} />
                  <div className="p-4 flex gap-2 border-t">
                    <button
                      onClick={() => handleApprove(ad.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                    >
                      Təsdiqlə
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-700">Təsdiq gözləyən elan yoxdur</p>
            </div>
          )}
        </section>

        {/* Təsdiqlənmişlər */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Təsdiqlənmişlər ({approvedAds.length})</h2>
          </div>
          
          {approvedAds.length > 0 ? (
            <div className="space-y-4">
              {approvedAds.map(ad => (
                <div key={ad.id} className="border rounded-lg overflow-hidden bg-green-50">
                  <AdCard ad={ad} showControls={false} />
                  <div className="p-4 border-t">
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-700">Təsdiqlənmiş elan yoxdur</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}