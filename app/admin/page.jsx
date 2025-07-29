"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AdCard from "@/components/AdCard";
import { FiCheckCircle, FiTrash2, FiRefreshCw, FiLogOut } from "react-icons/fi";

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [filter, setFilter] = useState("pending"); // "pending" | "approved" | "all"
  const [userEmail, setUserEmail] = useState("");

  const refreshAds = async () => {
    setLoading(true);
    setError(null);
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

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from("car_ads")
        .update({ is_public: true })
        .eq("id", id);

      if (error) throw error;
      await refreshAds();
    } catch (err) {
      alert("Təsdiqləmə xətası: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;

    try {
      const { data: images } = await supabase
        .from("car_images")
        .select("*")
        .eq("car_ad_id", id);

      const filesToDelete = images.map((img) =>
        img.image_url.split("/").pop()
      );

      if (filesToDelete.length > 0) {
        await supabase.storage.from("car-images").remove(filesToDelete);
      }

      const { error } = await supabase.from("car_ads").delete().eq("id", id);
      if (error) throw error;

      setAds((prev) => prev.filter((ad) => ad.id !== id));
    } catch (err) {
      alert("Silinmə xətası: " + err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push("/login");
          return false;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user || user.app_metadata?.role !== "admin") {
          router.push("/");
          return false;
        }

        setUserEmail(user.email || "");
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
      await refreshAds();
    };

    loadData();
  }, []);

  if (!authChecked || loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-semibold mb-6 text-[#00272b]">
          Admin Panel
        </h1>
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#e0FF4F]"></div>
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Yenidən yoxla
        </button>
      </div>
    );
  }

  // Filter ads based on selection
  const filteredAds =
    filter === "all"
      ? ads
      : filter === "approved"
      ? ads.filter((ad) => ad.is_public)
      : ads.filter((ad) => !ad.is_public);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#00272b]">Admin Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 select-none">{userEmail}</span>
          <button
            onClick={handleLogout}
            title="Çıxış"
            className="flex items-center cursor-pointer gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
          >
            <FiLogOut size={18} />
            Çıxış
          </button>
        </div>
      </header>

      {/* Filter tabs */}
      <nav className="mb-6 flex flex-wrap gap-3">
        {[
          { key: "pending", label: "Təsdiq Gözləyənlər" },
          { key: "approved", label: "Təsdiqlənmişlər" },
          { key: "all", label: "Bütün elanlar" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded cursor-pointer font-semibold transition ${
              filter === key
                ? "bg-[#00272b] text-[#e0FF4F]"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Ads list */}
      {filteredAds.length === 0 ? (
        <div className="text-center py-12 text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
          {filter === "pending"
            ? "Təsdiq gözləyən elan yoxdur"
            : filter === "approved"
            ? "Təsdiqlənmiş elan yoxdur"
            : "Elan tapılmadı"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[75vh] overflow-y-auto">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className={`border rounded-lg overflow-hidden shadow-sm ${
                !ad.is_public ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"
              }`}
            >
              <AdCard ad={ad} showControls={false} />
              <div className="p-3 border-t flex gap-3">
                {!ad.is_public && (
                  <button
                    onClick={() => handleApprove(ad.id)}
                    title="Təsdiqlə"
                    className="flex-1 flex cursor-pointer items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
                  >
                    <FiCheckCircle size={20} />
                    Təsdiqlə
                  </button>
                )}
                <button
                  onClick={() => handleDelete(ad.id)}
                  title="Sil"
                  className="flex-1 flex cursor-pointer items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
                >
                  <FiTrash2 size={20} />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
