// app/add-ad/page.jsx
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { useState } from "react";
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

export default function AddAdPage() {
  const supabase = createClient();
  const router = useRouter();
  const [images, setImages] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (formData) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return alert("Giriş etməmisiniz");

    // Elan yaradılır
    const { data: ad, error: adError } = await supabase
      .from("car_ads")
      .insert([
        {
          ...formData,
          user_id: user.id,
          new: formData.new === "true",
          barter: formData.barter === "true",
        },
      ])
      .select()
      .single();

    if (adError) return alert("Elan yaradılmadı");

    let mainImageUrl = null;

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileName = `${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("car-images")
        .upload(fileName, file);
      if (uploadError) continue;

      const { data: publicData } = supabase.storage
        .from("car-images")
        .getPublicUrl(fileName);

      const imageUrl = publicData?.publicUrl;
      if (!imageUrl) continue;

      // İlk şəkli əsas şəkil kimi saxla
      if (i === 0) mainImageUrl = imageUrl;

      await supabase.from("car_images").insert([
        { car_ad_id: ad.id, image_url: imageUrl },
      ]);
    }

    // Əsas şəkli car_ads cədvəlinə yaz
    if (mainImageUrl) {
      await supabase
        .from("car_ads")
        .update({ main_image_url: mainImageUrl })
        .eq("id", ad.id);
    }

    reset();
    router.push("/profile");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 space-y-4 max-w-2xl mx-auto"
    >
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

      <button
        type="submit"
        className="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Elanı Yerləşdir
      </button>
    </form>
  );
}
