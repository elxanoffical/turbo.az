export default function AdCard({ ad }) {
  return (
    <div className="border rounded shadow p-3">
      <img
        src={ad.main_image_url || "/placeholder.jpg"}
        alt="Maşın"
        className="w-full h-48 object-cover rounded mb-2"
      />
      <h2 className="text-lg font-bold">
        {ad.brand} {ad.model}
      </h2>
      <p className="text-gray-600">{ad.year} · {ad.price} AZN</p>
      <p className="text-sm text-gray-500">{ad.city}</p>
    </div>
  );
}
