// components/AdCard.jsx
"use client";
import { useRouter } from "next/navigation";

export default function AdCard({ ad, onDelete, showControls = true }) {
  const router = useRouter();

  const handleCardClick = () => {
    if (!showControls) {
      router.push(`/${ad.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`border rounded cursor-pointer shadow p-3 flex flex-col transition duration-300 ${
        !showControls ? "cursor-pointer hover:scale-95" : ""
      }`}
    >
      <img
        src={ad.main_image_url || "/placeholder.jpg"}
        alt="Maşın"
        className="w-full h-48 object-cover rounded mb-2"
      />
      <h2 className="text-lg font-bold">{ad.brand} {ad.model}</h2>
      <p className="text-gray-600">{ad.year} · {ad.price} AZN</p>
      <p className="text-sm text-gray-500 mb-2">{ad.city}</p>

      {showControls && (
        <div className="mt-auto flex justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile/edit/${ad.id}`);
            }}
            className="text-blue-600 cursor-pointer border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 text-sm"
          >
            Redaktə
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(ad.id);
            }}
            className="text-red-600 cursor-pointer border border-red-600 px-3 py-1 rounded hover:bg-red-50 text-sm"
          >
            Sil
          </button>
        </div>
      )}
    </div>
  );
}
