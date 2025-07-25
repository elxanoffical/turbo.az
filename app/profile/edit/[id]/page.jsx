// app/profile/edit/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import ImageUploader from "@/components/ImageUploader";

const cities = ["Bakı", "Gəncə", "Sumqayıt"];
const bodies = ["Sedan", "SUV", "Hatchback"];
const fuels = ["Benzin", "Dizel", "Elektrik"];
const transmissions = ["Avtomat", "Mexaniki"];
const drives = ["Arxa", "Ön", "Tam"];
const markets = ["Avropa", "Amerika", "Yaponiya"];
const colors = ["Qara", "Ağ", "Boz", "Qırmızı"];

export default function EditAdPage() {
  const supabase = createClient();
  const router = useRouter();
  const { id } = useParams();
  const { register, handleSubmit, reset, setValue } = useForm();
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchAd() {
      const { data, error } = await supabase
        .from("car_ads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return alert("Elan tapılmadı");

      Object.keys(data).forEach((key) => {
        setValue(key, data[key]);
      });
    }

    fetchAd();
  }, [id]);

  const onSubmit = async (formData) => {
    const { error } = await supabase
      .from("car_ads")
      .update({
        ...formData,
        new: formData.new === "true",
        barter: formData.barter === "true",
      })
      .eq("id", id);

    if (error) return alert("Dəyişikliklər qeydə alınmadı");

    router.push("/profile");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 space-y-4 max-w-2xl mx-auto"
    >
      <h1 className="text-xl font-semibold mb-4">Elanı Redaktə Et</h1>

      <FormSelect register={register} name="city" label="Şəhər" options={cities} required />
      <FormInput register={register} name="brand" label="Marka" required />
      <FormInput register={register} name="model" label="Model" required />
      <FormInput register={register} name="year" label="Buraxılış ili" type="number" required />
      <FormSelect register={register} name="body" label="Ban növü" options={bodies} />
      <FormSelect register={register} name="color" label="Rəng" options={colors} />
      <FormSelect register={register} name="fuel" label="Yanacaq növü" options={fuels} />
      <FormInput register={register} name="engine" label="Mühərrik həcmi" />
      <FormInput register={register} name="mileage" label="Yürüş (km)" type="number" />
      <FormSelect register={register} name="transmission" label="Sürət qutusu" options={transmissions} />
      <FormSelect register={register} name="drive" label="Ötürücü" options={drives} />
      <FormSelect register={register} name="market" label="Bazar tipi" options={markets} />
      <FormInput register={register} name="owners" label="Sahiblərin sayı" type="number" />
      <FormInput register={register} name="seats" label="Oturacaq sayı" type="number" />
      <FormInput register={register} name="condition" label="Texniki vəziyyət" />
      <FormInput register={register} name="price" label="Qiymət" type="number" required />
      <FormSelect register={register} name="new" label="Yeni?" options={["true", "false"]} />
      <FormSelect register={register} name="barter" label="Barter mümkündür?" options={["true", "false"]} />

      <ImageUploader onChange={setImages} />

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          İmtina Et
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Elanı Yenilə
        </button>
      </div>
    </form>
  );
}
