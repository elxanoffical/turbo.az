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
    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select
          name="brand"
          value={filters.brand}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Marka</option>
          {Object.keys(brandModelOptions).map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          name="model"
          value={filters.model}
          onChange={handleChange}
          disabled={!filters.brand}
          className="p-2 border rounded"
        >
          <option value="">Model</option>
          {modelOptions.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        <input
          name="city"
          placeholder="Şəhər"
          value={filters.city}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <select
          name="new"
          value={filters.new}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Hamısı</option>
          <option value="true">Yeni</option>
          <option value="false">Sürülmüş</option>
        </select>

        <input
          name="price_min"
          placeholder="Qiymət, min"
          value={filters.price_min}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="price_max"
          placeholder="maks."
          value={filters.price_max}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="barter"
            checked={filters.barter}
            onChange={handleChange}
          />
          <span>Barter</span>
        </label>

        <select
          name="body"
          value={filters.body}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Ban növü</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Hetçbek">Hetçbek</option>
          <option value="Kupe">Kupe</option>
          <option value="Universal">Universal</option>
          <option value="Pikap">Pikap</option>
        </select>

        {expanded && (
          <>
            <input
              name="year_min"
              placeholder="İl, min"
              value={filters.year_min}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="year_max"
              placeholder="maks."
              value={filters.year_max}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="mileage_min"
              placeholder="Yürüş, min"
              value={filters.mileage_min}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="mileage_max"
              placeholder="maks."
              value={filters.mileage_max}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="engine"
              placeholder="Mühərrik (məs. 2.0)"
              value={filters.engine}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="color"
              placeholder="Rəng"
              value={filters.color}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="fuel"
              placeholder="Yanacaq"
              value={filters.fuel}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="transmission"
              placeholder="Sürətlər qutusu"
              value={filters.transmission}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="drive"
              placeholder="Ötürücü (məs. Arxa)"
              value={filters.drive}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="owners"
              placeholder="Sahiblər sayı"
              value={filters.owners}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="seats"
              placeholder="Oturacaq sayı"
              value={filters.seats}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="condition"
              placeholder="Vəziyyət"
              value={filters.condition}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              name="market"
              placeholder="Bazar (məs. Avropa)"
              value={filters.market}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleSubmit}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Elanları göstər
        </button>
        <button onClick={handleReset} className="text-gray-700 underline">
          Sıfırla
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 underline"
        >
          {expanded ? "Daha az filter" : "Daha çox filter"}
        </button>
      </div>
    </div>
  );
}
