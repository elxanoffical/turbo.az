"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import AdCard from "@/components/AdCard";

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchAds = async () => {
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

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // İlk öncə istifadəçinin giriş etdiyini yoxla
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Sonra istifadəçi məlumatlarını yoxla
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user || user.app_metadata?.role !== 'admin') {
          router.push('/');
          return;
        }

        setAuthChecked(true);
        fetchAds();
      } catch (err) {
        console.error('Admin check error:', err);
        setError(err.message);
        router.push('/');
      }
    };
    
    checkAdmin();
  }, []);

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from("car_ads")
        .update({ is_public: true })
        .eq("id", id);
      
      if (error) throw error;
      fetchAds();
    } catch (err) {
      alert("Təsdiqləmə xətası: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;
    
    try {
      // Şəkilləri sil
      const { data: images, error: imgError } = await supabase
        .from("car_images")
        .select("*")
        .eq("car_ad_id", id);

      if (imgError) throw imgError;

      const filesToDelete = images.map(img => {
        const urlParts = img.image_url.split('/');
        return urlParts[urlParts.length - 1];
      });

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

  if (!authChecked || loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Yoxlanılır...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Xəta: {error}</h1>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Yenidən yüklə
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Admin Panel - Təsdiq Gözləyən Elanlar ({ads.filter(ad => !ad.is_public).length})
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/profile')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Profilə qayıt
          </button>
          <button
            onClick={fetchAds}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Yenilə
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Təsdiq Gözləyən Elanlar</h2>
          {ads.filter(ad => !ad.is_public).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ads.filter(ad => !ad.is_public).map(ad => (
                <div key={ad.id} className="border rounded p-4 shadow bg-yellow-50">
                  <AdCard ad={ad} showControls={false} />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleApprove(ad.id)}
                      className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Təsdiqlə
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Təsdiq gözləyən elan yoxdur</p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Təsdiqlənmiş Elanlar</h2>
          {ads.filter(ad => ad.is_public).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ads.filter(ad => ad.is_public).map(ad => (
                <div key={ad.id} className="border rounded p-4 shadow bg-green-50">
                  <AdCard ad={ad} showControls={false} />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Təsdiqlənmiş elan yoxdur</p>
          )}
        </section>
      </div>
    </div>
  );
}