import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from 'next/headers';

export default async function AdDetailsPage({ params }) {
  try {
    const cookieStore = cookies();
    if (!cookieStore) {
      throw new Error('Cookie store is not available');
    }
    
    const supabase = createServerClient(cookieStore);
    const { id } = params;

    // Elan məlumatlarını və şəkilləri gətir
    const { data: ad, error } = await supabase
      .from("car_ads")
      .select("*, car_images(image_url)")
      .eq("id", id)
      .single();

    if (!ad || error) {
      return (
        <div className="p-6 text-center text-red-500 text-lg">
          Elan tapılmadı və ya artıq mövcud deyil.
        </div>
      );
    }

    // Bütün şəkilləri bir array-də birləşdir (əsas şəkil + digər şəkillər)
    const allImages = [
      ad.main_image_url, 
      ...(ad.car_images?.map(img => img.image_url) || [])
    ].filter(Boolean); // Null/undefined dəyərləri çıxar

    return (
      <div className="p-6 max-w-5xl mx-auto">
        {/* Şəkillər Qalereyası */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {allImages.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${ad.brand} ${ad.model} - Şəkil ${index + 1}`}
              className="w-full h-64 object-cover rounded-lg shadow-md"
              loading={index > 0 ? "lazy" : "eager"} // İlk şəkil üçün eager loading
            />
          ))}
        </div>

        {/* Əsas məlumatlar */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {ad.brand} {ad.model} ({ad.year})
          </h1>
          <p className="text-2xl text-blue-600 font-semibold mb-4">{ad.price} AZN</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p><span className="font-semibold">Şəhər:</span> {ad.city}</p>
              <p><span className="font-semibold">Ban növü:</span> {ad.body_type || "N/A"}</p>
              <p><span className="font-semibold">Yanacaq növü:</span> {ad.fuel_type || "N/A"}</p>
              <p><span className="font-semibold">Mühərrik həcmi:</span> {ad.engine || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Yürüş:</span> {ad.mileage ? `${ad.mileage} km` : "N/A"}</p>
              <p><span className="font-semibold">Sürət qutusu:</span> {ad.transmission || "N/A"}</p>
              <p><span className="font-semibold">Rəng:</span> {ad.color || "N/A"}</p>
              <p><span className="font-semibold">Buraxılış ili:</span> {ad.year}</p>
            </div>
          </div>
        </div>

        {/* Əlavə xüsusiyyətlər */}
        {ad.features && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Xüsusiyyətlər</h2>
            <div className="flex flex-wrap gap-2">
              {ad.features.split(',').map((feature, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  {feature.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ətraflı məlumat */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Ətraflı məlumat</h2>
          <p className="whitespace-pre-line">
            {ad.description || "Satıcı əlavə məlumat daxil etməyib."}
          </p>
        </div>

        {/* Əlaqə məlumatları (əgər ictimai elandırsa) */}
        {ad.is_public && (
          <div className="mt-8 p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Satıcı ilə əlaqə</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Yerləşdirilib:</span> {new Date(ad.created_at).toLocaleDateString('az-AZ')}</p>
              <p><span className="font-semibold">Status:</span> {ad.is_public ? "Təsdiqlənib" : "Təsdiq gözləyir"}</p>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in AdDetailsPage:', error);
    return (
      <div className="p-6 text-center text-red-500 text-lg">
        Xəta baş verdi: {error.message || 'Server xətası'}
      </div>
    );
  }
}