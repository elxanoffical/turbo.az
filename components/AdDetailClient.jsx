"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function AdDetailClient({ ad, allImages }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    if (direction === "left") {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const Info = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between border-b py-2">
        <span className="font-medium text-[#00272b]">{label}:</span>
        <span className="text-gray-700">{value}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Geri düyməsi */}
      <div className="mb-4">
        <Link
          href="/profile"
          className="text-[#e0FF4F] hover:underline flex items-center gap-1"
        >
          <FaChevronLeft /> Profilə qayıt
        </Link>
      </div>

      {/* Şəkillər qalereyası */}
      {allImages.length > 0 && (
        <div className="relative mb-6">
          <button
            onClick={() => scroll("left")}
            aria-label="Sol"
            className="absolute top-1/2 left-0 -translate-y-1/2 bg-[#00272b] cursor-pointer hover:bg-[#004b48] text-[#e0FF4F] rounded-full p-2 shadow-md z-20"
          >
            <FaChevronLeft size={24} />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth"
          >
            {allImages.map((url, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-80 h-48 rounded-lg shadow-md overflow-hidden"
              >
                <Image
                  src={url}
                  alt={`${ad.brand} ${ad.model} - Şəkil ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            aria-label="Sağ"
            className="absolute cursor-pointer top-1/2 right-0 -translate-y-1/2 bg-[#00272b] hover:bg-[#004b48] text-[#e0FF4F] rounded-full p-2 shadow-md z-20"
          >
            <FaChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Əsas məlumatlar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#00272b]">
          {ad.brand} {ad.model} ({ad.year})
        </h1>
        <p className="text-2xl text-[#e0FF4F] font-semibold mb-4">
          {ad.price} AZN
        </p>
        <p className="text-gray-600 mt-1">{ad.city}</p>
      </div>

      {/* Texniki xüsusiyyətlər */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 border rounded-lg p-4">
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
          <h2 className="text-xl font-semibold mb-4 text-[#00272b]">
            Ətraflı məlumat
          </h2>
          <p className="whitespace-pre-line text-gray-800">{ad.description}</p>
        </div>
      )}

      {/* Elan tarixi */}
      <div className="mt-6 text-sm text-gray-500">
        Elan tarixi: {new Date(ad.created_at).toLocaleDateString("az-AZ")}
      </div>
    </div>
  );
}
