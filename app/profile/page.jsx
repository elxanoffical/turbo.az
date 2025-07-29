"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import AdCard from "@/components/AdCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiUser } from "react-icons/fi";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    ads: [],
    loading: true,
    error: null,
  });
  const [authChecked, setAuthChecked] = useState(false);

  // Auth yoxlaması və istifadəçi məlumatları
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          router.push("/login");
          return;
        }
        setUser(user);
        setAuthChecked(true);
        fetchUserAds(user.id);
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/login");
      }
    };
    checkAuth();
  }, []);

  // İstifadəçinin elanlarını gətir
  const fetchUserAds = async (userId) => {
    try {
      const { data: ads, error } = await supabase
        .from("car_ads")
        .select("*, car_images(image_url)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setData({ ads, loading: false, error: null });
      router.refresh();
    } catch (error) {
      setData({ ads: [], loading: false, error: error.message });
    }
  };

  // Logout funksiyası
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Elan silmə funksiyası
  const handleDelete = async (adId) => {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;

    try {
      const { data: images } = await supabase
        .from("car_images")
        .select("image_url")
        .eq("car_ad_id", adId);

      if (images?.length > 0) {
        const filesToDelete = images.map((img) =>
          img.image_url.split("/").pop()
        );
        await supabase.storage.from("car-images").remove(filesToDelete);
      }

      const { error } = await supabase.from("car_ads").delete().eq("id", adId);
      if (error) throw error;

      await fetchUserAds(user.id);
    } catch (error) {
      alert(`Silinmə xətası: ${error.message}`);
    }
  };

  // Yeni elan əlavə et
  const handleAddNew = () => {
    router.push("/add");
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
      <div className="bg-red-50 border-l-2 border-red-400 text-red-700 p-6 max-w-md mx-auto rounded-md shadow-md mt-10">
        <p className="mb-4">{data.error}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => fetchUserAds(user.id)}
            className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded text-white"
          >
            Yenidən yoxla
          </button>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded text-white"
          >
            Yenidən daxil ol
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* İstifadəçi məlumatları və logout */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white shadow-md rounded-lg px-6 py-4 mb-10 border border-gray-200">
        <div className="flex items-center gap-4">
          <FiUser className="text-[#00272b] w-10 h-10" />
          <div>
            <p className="text-lg font-semibold text-[#00272b]">
              {user.email}
            </p>
            <p className="text-sm text-gray-500 select-text">İstifadəçi</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center cursor-pointer gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded transition"
          aria-label="Çıxış et"
        >
          <FiLogOut size={20} />
          Çıxış
        </button>
      </div>

      {/* Başlıq və yeni elan */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#00272b]">
          Elanlarım{" "}
          <span className="text-gray-500 font-normal">({data.ads.length})</span>
        </h1>
        <button
          onClick={handleAddNew}
          className="flex items-center cursor-pointer gap-2 bg-[#e0FF4F] hover:bg-[#c6d839] text-[#00272b] font-semibold px-5 py-3 rounded-lg shadow-md transition"
          aria-label="Yeni elan əlavə et"
        >
          <FiPlus size={20} />
          Yeni Elan
        </button>
      </div>

      {/* Elanlar */}
      {data.ads.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.ads.map((ad) => (
            <div
              key={ad.id}
              className="rounded-lg shadow hover:shadow-lg transition bg-white"
            >
              <AdCard
                ad={ad}
                showControls={false}
                isProfile={true}
              />
              <div className="flex justify-between items-center border-t border-gray-200 px-4 py-3 gap-3">
                <button
                  onClick={() => router.push(`/profile/edit/${ad.id}`)}
                  className="flex items-center cursor-pointer gap-1 text-blue-600 hover:text-blue-800 transition font-medium"
                  aria-label="Elanı redaktə et"
                  title="Redaktə et"
                >
                  <FiEdit2 size={18} />
                  Redaktə
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="flex items-center cursor-pointer gap-1 text-red-600 hover:text-red-800 transition font-medium"
                  aria-label="Elanı sil"
                  title="Sil"
                >
                  <FiTrash2 size={18} />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-6 text-lg">
            Hələ heç bir elan yaratmamısınız
          </p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-[#e0FF4F] hover:bg-[#c6d839] text-[#00272b] font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            <FiPlus size={20} />
            İlk Elanınızı Yarat
          </button>
        </div>
      )}
    </div>
  );
}
