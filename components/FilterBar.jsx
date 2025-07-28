// components/FilterBar.jsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    city: "",
    price_min: "",
    price_max: "",
    year_min: "",
    year_max: "",
    new: "",
    barter: false,
    credit: false, // gələcəkdə əlavə oluna bilər
    body: "",
  });

  useEffect(() => {
    const newFilters = {};
    for (const [key, value] of searchParams.entries()) {
      newFilters[key] = value;
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
    setFilters({
      brand: "",
      model: "",
      city: "",
      price_min: "",
      price_max: "",
      year_min: "",
      year_max: "",
      new: "",
      barter: false,
      credit: false,
      body: "",
    });
    router.push("/");
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          name="brand"
          placeholder="Marka"
          value={filters.brand}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="model"
          placeholder="Model"
          value={filters.model}
          onChange={handleChange}
          className="p-2 border rounded"
        />
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
          {/* digər ban növləri */}
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
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={handleSubmit} className="bg-red-600 text-white px-4 py-2 rounded">
          Elanları göstər
        </button>
        <button onClick={handleReset} className="text-gray-700 underline">
          Sıfırla
        </button>
        <button onClick={() => setExpanded(!expanded)} className="text-blue-600 underline">
          {expanded ? "Daha az filter" : "Daha çox filter"}
        </button>
      </div>
    </div>
  );
}
