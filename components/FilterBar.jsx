"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const brandModelOptions = {
  BMW: ["X5", "X6", "M5"],
  Mercedes: ["E-Class", "C-Class", "GLA"],
  Audi: ["A4", "A6", "Q7"],
  Hyundai: ["Elantra", "Sonata"],
  Kia: ["Sportage", "Optima"],
  Toyota: ["Camry", "Corolla"],
  Lexus: ["RX", "NX"],
  Chevrolet: ["Cruze", "Malibu"],
};

export default function FilterBar({ searchParams }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    city: "",
    price_min: "",
    price_max: "",
    year_min: "",
    year_max: "",
    mileage_min: "",
    mileage_max: "",
    engine: "",
    color: "",
    fuel: "",
    transmission: "",
    drive: "",
    new: "",
    barter: false,
    owners: "",
    seats: "",
    condition: "",
    market: "",
    body: "",
  });

  // ✅ SSR searchParams obyektinə uyğunlaşdırılmış versiya
  useEffect(() => {
    const newFilters = {};
    for (const key in searchParams) {
      newFilters[key] = searchParams[key];
    }
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    const query = new URLSearchParams();
    for (const key in filters) {
      const val = filters[key];
      if (val !== "" && val !== false) query.set(key, val);
    }
    router.push("/?" + query.toString());
  };

  const handleReset = () => {
    const resetState = {};
    for (const key in filters) {
      resetState[key] = typeof filters[key] === "boolean" ? false : "";
    }
    setFilters(resetState);
    router.push("/");
  };

  const modelOptions = brandModelOptions[filters.brand] || [];

  return (
    <div className="bg-[#00272b] text-white p-5 rounded-2xl shadow-lg mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Marka */}
        <select
          name="brand"
          value={filters.brand}
          onChange={handleChange}
          className="bg-[#001f24] text-white p-3 rounded-lg border border-[#e0FF4F] focus:outline-none"
        >
          <option value="">Marka</option>
          {Object.keys(brandModelOptions).map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        {/* Model */}
        <select
          name="model"
          value={filters.model}
          onChange={handleChange}
          disabled={!filters.brand}
          className="bg-[#001f24] text-white p-3 rounded-lg border border-[#e0FF4F] focus:outline-none disabled:opacity-50"
        >
          <option value="">Model</option>
          {modelOptions.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        {/* Şəhər */}
        <input
          name="city"
          placeholder="Şəhər"
          value={filters.city}
          onChange={handleChange}
          className="bg-[#001f24] text-white p-3 rounded-lg border border-[#e0FF4F] placeholder:text-gray-400 focus:outline-none"
        />

        {/* Yeni/Sürülmüş */}
        <select
          name="new"
          value={filters.new}
          onChange={handleChange}
          className="bg-[#001f24] text-white p-3 rounded-lg border border-[#e0FF4F] focus:outline-none"
        >
          <option value="">Yeni / Sürülmüş</option>
          <option value="true">Yeni</option>
          <option value="false">Sürülmüş</option>
        </select>

        {/* Qiymət */}
        <input
          name="price_min"
          placeholder="Qiymət, min"
          value={filters.price_min}
          onChange={handleChange}
          className="bg-[#001f24] text-white p-3 rounded-lg border border-[#e0FF4F] placeholder:text-gray-400"
        />
        <input
          name="price_max"
          placeholder="maks."
          value={filters.price_max}
          onChange={handleChange}
          className="bg-[#001f24] text-white p-3 rounded-lg border border-[#e0FF4F] placeholder:text-gray-400"
        />

        {/* Barter */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="barter"
            checked={filters.barter}
            onChange={handleChange}
            className="accent-[#e0FF4F]"
          />
          <span>Barter</span>
        </label>

        {/* Ban növü */}
        <select
          name="body"
          value={filters.body}
          onChange={handleChange}
          className="bg-[#001f24] text-white p-3 rounded-lg border border-[#e0FF4F] focus:outline-none"
        >
          <option value="">Ban növü</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Hetçbek">Hetçbek</option>
          <option value="Kupe">Kupe</option>
          <option value="Universal">Universal</option>
          <option value="Pikap">Pikap</option>
        </select>

        {/* Daha çox filtrelər (Əgər açılıbsa) */}
        {expanded && (
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[
              "year_min",
              "year_max",
              "mileage_min",
              "mileage_max",
              "engine",
              "color",
              "fuel",
              "transmission",
              "drive",
              "owners",
              "seats",
              "condition",
              "market",
            ].map((name) => (
              <input
                key={name}
                name={name}
                placeholder={name
                  .replace("min", "min.")
                  .replace("max", "maks.")
                  .replace("_", " ")
                  .replace("year", "İl")
                  .replace("mileage", "Yürüş")
                  .replace("engine", "Mühərrik")
                  .replace("color", "Rəng")
                  .replace("fuel", "Yanacaq")
                  .replace("transmission", "Sürət qutusu")
                  .replace("drive", "Ötürücü")
                  .replace("owners", "Sahiblər")
                  .replace("seats", "Oturacaq sayı")
                  .replace("condition", "Vəziyyəti")
                  .replace("market", "Bazar növü")}
                value={filters[name]}
                onChange={handleChange}
                className="bg-[#001f24] text-white p-3 rounded-lg border border-[#e0FF4F] placeholder:text-gray-400 focus:outline-none"
              />
            ))}
          </div>
        )}
      </div>

      {/* Aşağıdakı düymələr */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={handleSubmit}
          className="bg-[#e0FF4F] text-[#00272b] font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition"
        >
          Elanları göstər
        </button>
        <button
          onClick={handleReset}
          className="text-white underline hover:text-yellow-300"
        >
          Sıfırla
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white underline hover:text-yellow-300"
        >
          {expanded ? "Daha az filter" : "Daha çox filter"}
        </button>
      </div>
    </div>
  );
}
