// app/admin/page.jsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();
  const [ads, setAds] = useState([]);

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from("car_ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setAds(data);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleApprove = async (id) => {
    await supabase.from("car_ads").update({ is_public: true }).eq("id", id);
    fetchAds();
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;
    await supabase.from("car_ads").delete().eq("id", id);
    fetchAds();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Bütün Elanlar (Admin Panel)</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="border rounded p-3 shadow">
            <img src={ad.main_image_url || "/placeholder.jpg"} className="h-40 w-full object-cover mb-2" />
            <h2 className="font-bold">{ad.brand} {ad.model}</h2>
            <p>{ad.city} · {ad.price} AZN</p>
            <div className="mt-2 flex gap-2">
              {!ad.is_public && (
                <button
                  onClick={() => handleApprove(ad.id)}
                  className="text-green-700 border border-green-700 px-2 py-1 rounded text-sm hover:bg-green-50"
                >
                  Təsdiqlə
                </button>
              )}
              <button
                onClick={() => router.push(`/profile/edit/${ad.id}`)}
                className="text-blue-600 border border-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-50"
              >
                Redaktə
              </button>
              <button
                onClick={() => handleDelete(ad.id)}
                className="text-red-600 border border-red-600 px-2 py-1 rounded text-sm hover:bg-red-50"
              >
                Sil
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {ad.is_public ? "✅ Təsdiqlənib" : "❌ Təsdiqlənməyib"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
