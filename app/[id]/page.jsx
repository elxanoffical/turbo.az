// app/[id]/page.jsx
import { createServerClient } from "@/lib/supabaseServer";

export default async function AdDetailsPage({ params }) {
  const supabase = await createServerClient();

  const { data: ad, error } = await supabase
    .from("car_ads")
    .select("*, car_images(image_url)")
    .eq("id", params.id)
    .eq("is_public", true)
    .single();

  if (!ad || error) {
    return (
      <div className="p-6 text-center text-red-500 text-lg">
        Elan tapılmadı və ya artıq mövcud deyil.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Şəkillər Qalereyası */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[ad.main_image_url, ...(ad.car_images || []).map((img) => img.image_url)]
          .filter(Boolean)
          .map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Şəkil ${i + 1}`}
              className="w-full h-64 object-cover rounded"
            />
          ))}
      </div>

      {/* Başlıq */}
      <h1 className="text-3xl font-bold mb-2">
        {ad.brand} {ad.model} ({ad.year})
      </h1>

      {/* Əsas Məlumatlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 mb-6">
        <div>
          <p><span className="font-semibold">Qiymət:</span> {ad.price} AZN</p>
          <p><span className="font-semibold">Şəhər:</span> {ad.city}</p>
          <p><span className="font-semibold">Ban növü:</span> {ad.body_type || "N/A"}</p>
          <p><span className="font-semibold">Yanacaq növü:</span> {ad.fuel_type || "N/A"}</p>
        </div>
        <div>
          <p><span className="font-semibold">Yürüş:</span> {ad.mileage || "N/A"} km</p>
          <p><span className="font-semibold">Sürət qutusu:</span> {ad.transmission || "N/A"}</p>
          <p><span className="font-semibold">Rəng:</span> {ad.color || "N/A"}</p>
          <p><span className="font-semibold">Yerləşdirilmə tarixi:</span> {new Date(ad.created_at).toLocaleDateString("az-Latn-AZ")}</p>
        </div>
      </div>

      {/* Ətraflı məlumat */}
      <div className="bg-gray-100 p-4 rounded text-gray-700">
        <h2 className="text-xl font-semibold mb-2">Ətraflı məlumat</h2>
        <p>{ad.description || "Satıcı əlavə məlumat daxil etməyib."}</p>
      </div>
    </div>
  );
}
