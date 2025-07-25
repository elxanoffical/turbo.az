// app/profile/[id]/page.jsx
import { createServerClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";

export default async function AdDetailPage({ params }) {
  const supabase = await createServerClient();
  const { id } = await params;

  const { data: ad, error } = await supabase
    .from("car_ads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ad) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <img
        src={ad.main_image_url || "/placeholder.jpg"}
        alt={`${ad.brand} ${ad.model}`}
        className="w-full h-80 object-cover rounded mb-6 shadow"
      />

      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">
          {ad.brand} {ad.model} ({ad.year})
        </h1>
        <p className="text-xl text-green-700 font-semibold">{ad.price} AZN</p>
        <p className="text-gray-600 mt-1">{ad.city}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <Info label="Ban növü" value={ad.body} />
        <Info label="Yanacaq növü" value={ad.fuel} />
        <Info label="Mühərrik" value={ad.engine} />
        <Info label="Yürüş" value={ad.mileage ? `${ad.mileage} km` : ""} />
        <Info label="Sürət qutusu" value={ad.transmission} />
        <Info label="Ötürücü" value={ad.drive} />
        <Info label="Bazar tipi" value={ad.market} />
        <Info label="Sahib sayı" value={ad.owners} />
        <Info label="Oturacaq sayı" value={ad.seats} />
        <Info label="Texniki vəziyyət" value={ad.condition} />
        <Info label="Yeni?" value={ad.new ? "Bəli" : "Xeyr"} />
        <Info label="Barter mümkündür?" value={ad.barter ? "Bəli" : "Xeyr"} />
      </div>
    </div>
  );
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
