// app/profile/[id]/page.jsx
import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from 'next/headers';
import { notFound } from "next/navigation";
import DeleteAdButton from "@/components/DeleteAdButton";

import Link from 'next/link';

export default async function AdDetailPage({ params }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { id } = params;

try {
    // 1. İstifadəçi yoxlaması
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Giriş etməmisiniz");

    // 2. Yalnız bu istifadəçiyə aid elanı gətir
    const { data: ad, error: adError } = await supabase
      .from("car_ads")
      .select("*, car_images(image_url)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (adError || !ad) return notFound();

    // 3. Şəkilləri hazırla
    const allImages = [
      ad.main_image_url, 
      ...(ad.car_images?.map(img => img.image_url) || [])
    ].filter(Boolean);


    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Geri dönmə düyməsi */}
        <div className="mb-4">
          <Link href="/profile" className="text-blue-600 hover:underline">
            &larr; Geri
          </Link>
        </div>

        {/* Şəkillər Qalereyası */}
        {allImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {allImages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${ad.brand} ${ad.model} - Şəkil ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                loading={index > 0 ? "lazy" : "eager"}
              />
            ))}
          </div>
        )}

        {/* Əsas məlumatlar */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {ad.brand} {ad.model} ({ad.year})
          </h1>
          <p className="text-2xl text-green-700 font-semibold mb-4">{ad.price} AZN</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Info label="Şəhər" value={ad.city} />
              <Info label="Ban növü" value={ad.body} />
              <Info label="Yanacaq növü" value={ad.fuel} />
              <Info label="Mühərrik" value={ad.engine} />
              <Info label="Yürüş" value={ad.mileage ? `${ad.mileage} km` : null} />
            </div>
            <div className="space-y-2">
              <Info label="Sürət qutusu" value={ad.transmission} />
              <Info label="Rəng" value={ad.color} />
              <Info label="Buraxılış ili" value={ad.year} />
              <Info label="Bazar tipi" value={ad.market} />
              <Info label="Sahib sayı" value={ad.owners} />
            </div>
          </div>
        </div>

        {/* Əlavə məlumatlar */}
        <div className="space-y-4">
          <Info label="Oturacaq sayı" value={ad.seats} />
          <Info label="Texniki vəziyyət" value={ad.condition} />
          <Info label="Yeni?" value={ad.new ? "Bəli" : "Xeyr"} />
          <Info label="Barter mümkündür?" value={ad.barter ? "Bəli" : "Xeyr"} />
        </div>

        {/* Ətraflı məlumat */}
        {ad.description && (
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Ətraflı məlumat</h2>
            <p className="whitespace-pre-line">{ad.description}</p>
          </div>
        )}

        {/* Redaktə və silmə düymələri */}
        <div className="mt-8 flex gap-4">
          <Link
            href={`/profile/edit/${ad.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Redaktə et
          </Link>
          <DeleteAdButton adId={ad.id} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in AdDetailPage:', error);
    return notFound();
  }
}

function Info({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex justify-between border-b py-2">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
}