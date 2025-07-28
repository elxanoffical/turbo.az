import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function AdDetailPage({ params }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { id } = params;

  try {
    // Elan məlumatlarını gətir
    const { data: ad, error } = await supabase
      .from("car_ads")
      .select("*, car_images(image_url)")
      .eq("id", id)
      // .eq("is_public", true)
      .single();

    if (error || !ad) return notFound();

    // Şəkilləri hazırla
    const allImages = [
      ad.main_image_url, 
      ...(ad.car_images?.map(img => img.image_url) || [])
    ].filter(Boolean);

    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Geri düyməsi */}
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; elanlara qayıt
          </Link>
        </div>

        {/* Şəkillər qalereyası */}
        {allImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {allImages.map((url, index) => (
              <div key={index} className="relative h-64">
                <Image
                  src={url}
                  alt={`${ad.brand} ${ad.model} - Şəkil ${index + 1}`}
                  fill
                  className="object-cover rounded-lg shadow-md"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        )}

        {/* Əsas məlumatlar */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {ad.brand} {ad.model} ({ad.year})
          </h1>
          <p className="text-2xl text-green-700 font-semibold mb-4">{ad.price} AZN</p>
          <p className="text-gray-600 mt-1">{ad.city}</p>
        </div>

        {/* Texniki xüsusiyyətlər */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <Info label="Ban növü" value={ad.body} />
          <Info label="Yanacaq növü" value={ad.fuel} />
          <Info label="Mühərrik" value={ad.engine} />
          <Info label="Yürüş" value={ad.mileage ? `${ad.mileage} km` : null} />
          <Info label="Sürət qutusu" value={ad.transmission} />
          <Info label="Ötürücü" value={ad.drive} />
          <Info label="Bazar tipi" value={ad.market} />
          <Info label="Sahib sayı" value={ad.owners} />
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

        {/* Elan tarixi */}
        <div className="mt-6 text-sm text-gray-500">
          Elan tarixi: {new Date(ad.created_at).toLocaleDateString('az-AZ')}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in AdDetailPage:', error);
    return notFound();
  }
}

// Köməkçi komponent
function Info({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex justify-between border-b py-2">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
}