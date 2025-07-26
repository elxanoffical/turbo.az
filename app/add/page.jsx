"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function AddAdPage() {
  const supabase = createClient();
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkAuth();
  }, []);

  const onSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (userError || !user) throw new Error("Giriş etməmisiniz");

      const { data: ad, error: adError } = await supabase
        .from("car_ads")
        .insert([
          {
            ...formData,
            user_id: user.id,
            new: formData.new === "true",
            barter: formData.barter === "true",
            is_public: false,
          },
        ])
        .select()
        .single();

      if (adError) throw new Error("Elan yaradılmadı: " + adError.message);

      let uploadErrors = [];
      let mainImageUrl = null;

      for (let i = 0; i < images.length; i++) {
        try {
          const file = images[i];
          const fileName = `${Date.now()}_${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("car-images")
            .upload(fileName, file);
          if (uploadError) throw uploadError;

          const { data: publicData } = supabase.storage
            .from("car-images")
            .getPublicUrl(fileName);

          const imageUrl = publicData?.publicUrl;
          if (!imageUrl) throw new Error("URL yaradılmadı");

          if (i === 0) mainImageUrl = imageUrl;

          await supabase
            .from("car_images")
            .insert([{ car_ad_id: ad.id, image_url: imageUrl }]);
        } catch (uploadError) {
          uploadErrors.push(`Şəkil ${i + 1} xətası: ${uploadError.message}`);
        }
      }

      if (mainImageUrl) {
        await supabase
          .from("car_ads")
          .update({ main_image_url: mainImageUrl })
          .eq("id", ad.id);
      }

      if (uploadErrors.length > 0) {
        setError("Bəzi şəkillər yüklənmədi:\n" + uploadErrors.join("\n"));
      } else {
        reset();
        router.push("/profile");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 space-y-4 max-w-2xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-4">Yeni Elan Əlavə Et</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <FormSelect
        register={register}
        name="city"
        label="Şəhər"
        options={cities}
        required
      />
      <FormInput register={register} name="brand" label="Marka" required />
      <FormInput register={register} name="model" label="Model" required />
      <FormInput
        register={register}
        name="year"
        label="Buraxılış ili"
        type="number"
        required
      />
      <FormSelect
        register={register}
        name="body"
        label="Ban növü"
        options={bodies}
      />
      <FormSelect
        register={register}
        name="color"
        label="Rəng"
        options={colors}
      />
      <FormSelect
        register={register}
        name="fuel"
        label="Yanacaq növü"
        options={fuels}
      />
      <FormInput register={register} name="engine" label="Mühərrik həcmi" />
      <FormInput
        register={register}
        name="mileage"
        label="Yürüş (km)"
        type="number"
      />
      <FormSelect
        register={register}
        name="transmission"
        label="Sürət qutusu"
        options={transmissions}
      />
      <FormSelect
        register={register}
        name="drive"
        label="Ötürücü"
        options={drives}
      />
      <FormSelect
        register={register}
        name="market"
        label="Bazar tipi"
        options={markets}
      />
      <FormInput
        register={register}
        name="owners"
        label="Sahiblərin sayı"
        type="number"
      />
      <FormInput
        register={register}
        name="seats"
        label="Oturacaq sayı"
        type="number"
      />
      <FormInput
        register={register}
        name="condition"
        label="Texniki vəziyyət"
      />
      <FormInput
        register={register}
        name="price"
        label="Qiymət"
        type="number"
        required
      />
      <FormSelect
        register={register}
        name="new"
        label="Yeni?"
        options={["true", "false"]}
      />
      <FormSelect
        register={register}
        name="barter"
        label="Barter mümkündür?"
        options={["true", "false"]}
      />

      <ImageUploader onChange={setImages} />

      <button
        type="submit"
        disabled={loading}
        className={`btn px-4 py-2 rounded text-white ${
          loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Yüklənir..." : "Elanı Yerləşdir"}
      </button>

      <div className="text-sm text-gray-500 mt-2">
        Qeyd: Elan admin tərəfindən təsdiqləndikdən sonra ictimai görünəcək.
      </div>
    </form>
  );
}
