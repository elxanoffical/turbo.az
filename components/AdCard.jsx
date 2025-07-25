// components/AdCard.jsx
import Link from "next/link";

export default function AdCard({ ad }) {
  return (
    <div className="border rounded-2xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden bg-white">
      <div className="relative w-full h-48">
        <img
          src={ad.main_image_url || "/placeholder.jpg"}
          alt={`${ad.brand} ${ad.model}`}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4 space-y-1">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {ad.brand} {ad.model}
        </h2>
        <p className="text-gray-600 text-sm">
          {ad.year} · {ad.city}
        </p>
        <p className="text-blue-600 font-semibold text-lg">{ad.price.toLocaleString()} ₼</p>

        {/* Bu hissə növbəti mərhələdə göstəriləcək: edit/delete */}
        {/* <div className="flex gap-2 mt-3">
          <Link href={`/edit-ad/${ad.id}`} className="text-sm text-blue-500 hover:underline">
            Redaktə et
          </Link>
          <button className="text-sm text-red-500 hover:underline">Sil</button>
        </div> */}
      </div>
    </div>
  );
}
