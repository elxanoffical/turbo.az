"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import ImageUploader from "@/components/ImageUploader";
import LoadingSpinner from "@/components/LoadingSpinner";

const formOptions = {
  cities: ["Bakı", "Gəncə", "Sumqayıt"],
  bodies: ["Sedan", "SUV", "Hatchback"],
  fuels: ["Benzin", "Dizel", "Elektrik"],
  transmissions: ["Avtomat", "Mexaniki"],
  drives: ["Arxa", "Ön", "Tam"],
  markets: ["Avropa", "Amerika", "Yaponiya"],
  colors: ["Qara", "Ağ", "Boz", "Qırmızı"],
};

export default function AddAdPage() {
  const supabase = createClient();
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Auth yoxlaması
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/login");
      }
    };
    checkAuth();
  }, []);

  const uploadImages = async (adId) => {
    const uploadResults = [];

    for (const [index, file] of images.entries()) {
      try {
        const fileName = `${Date.now()}_${file.name}`;

        // Şəkil yüklə
        const { error: uploadError } = await supabase.storage
          .from("car-images")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        // Public URL al
        const { data } = supabase.storage
          .from("car-images")
          .getPublicUrl(fileName);
        const publicUrl = data.publicUrl;

        if (!publicUrl) throw new Error("Şəkil üçün public URL tapılmadı");

        // Verilənlər bazasına yaz
        const { error: insertError } = await supabase
          .from("car_images")
          .insert([
            {
              car_ad_id: adId,
              image_url: publicUrl,
            },
          ]);

        if (insertError) throw insertError;

        uploadResults.push({ success: true, url: publicUrl });

        // Əgər ilk şəkildirsə, əsas şəkil kimi təyin et
        if (index === 0) {
          const { error: updateError } = await supabase
            .from("car_ads")
            .update({ main_image_url: publicUrl })
            .eq("id", adId);

          if (updateError) throw updateError;
        }
      } catch (error) {
        console.error(`Şəkil ${index + 1} xətası:`, error);
        uploadResults.push({
          success: false,
          error: `Şəkil ${index + 1} xətası: ${error.message}`,
        });
      }
    }

    return uploadResults;
  };

  const onSubmit = async (formData) => {
    setStatus({ loading: true, error: null });

    try {
      // 1. İstifadəçi yoxlaması
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Giriş etməmisiniz");

      // 2. Əsas elan məlumatlarını yarat
      const { data: ad, error: adError } = await supabase
        .from("car_ads")
        .insert([
          {
            ...formData,
            user_id: user.id,
            price: Number(formData.price),
            year: Number(formData.year),
            mileage: formData.mileage ? Number(formData.mileage) : null,
            new: formData.new === "true",
            barter: formData.barter === "true",
            is_public: false,
          },
        ])
        .select()
        .single();

      if (adError) throw adError;

      // 3. Şəkilləri yüklə
      if (images.length > 0) {
        const uploadResults = await uploadImages(ad.id);
        const failedUploads = uploadResults.filter((r) => !r.success);

        if (failedUploads.length > 0) {
          throw new Error(
            `Bəzi şəkillər yüklənmədi:\n${failedUploads
              .map((u) => u.error)
              .join("\n")}`
          );
        }
      }

      // 4. Uğurlu olduqda profilə yönləndir
      setStatus({ loading: false, error: null });
      router.push("/profile");
      router.refresh(); // Əlavə etdik - səhifəni yenilə
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Yeni Elan Əlavə Et</h1>

      {status.error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="font-medium">Xəta baş verdi:</p>
          <p className="mt-1">{status.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormSelect
            register={register}
            name="city"
            label="Şəhər"
            options={formOptions.cities}
            error={errors.city}
            required
          />
          <FormInput
            register={register}
            name="brand"
            label="Marka"
            error={errors.brand}
            required
          />
          <FormInput
            register={register}
            name="model"
            label="Model"
            error={errors.model}
            required
          />
          <FormInput
            register={register}
            name="year"
            label="Buraxılış ili"
            type="number"
            error={errors.year}
            required
          />
          <FormSelect
            register={register}
            name="body"
            label="Ban növü"
            options={formOptions.bodies}
            error={errors.body}
          />
          <FormSelect
            register={register}
            name="color"
            label="Rəng"
            options={formOptions.colors}
            error={errors.color}
          />
          <FormSelect
            register={register}
            name="fuel"
            label="Yanacaq növü"
            options={formOptions.fuels}
            error={errors.fuel}
          />
          <FormInput
            register={register}
            name="engine"
            label="Mühərrik həcmi"
            error={errors.engine}
          />
          <FormInput
            register={register}
            name="mileage"
            label="Yürüş (km)"
            type="number"
            error={errors.mileage}
          />
          <FormSelect
            register={register}
            name="transmission"
            label="Sürət qutusu"
            options={formOptions.transmissions}
            error={errors.transmission}
          />
          <FormSelect
            register={register}
            name="drive"
            label="Ötürücü"
            options={formOptions.drives}
            error={errors.drive}
          />
          <FormSelect
            register={register}
            name="market"
            label="Bazar tipi"
            options={formOptions.markets}
            error={errors.market}
          />
          <FormInput
            register={register}
            name="owners"
            label="Sahiblərin sayı"
            type="number"
            error={errors.owners}
          />
          <FormInput
            register={register}
            name="seats"
            label="Oturacaq sayı"
            type="number"
            error={errors.seats}
          />
          <FormInput
            register={register}
            name="condition"
            label="Texniki vəziyyət"
            error={errors.condition}
          />
          <FormInput
            register={register}
            name="price"
            label="Qiymət (AZN)"
            type="number"
            error={errors.price}
            required
          />
          <FormSelect
            register={register}
            name="new"
            label="Yeni?"
            options={["true", "false"]}
            error={errors.new}
          />
          <FormSelect
            register={register}
            name="barter"
            label="Barter mümkündür?"
            options={["true", "false"]}
            error={errors.barter}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Şəkillər (Maksimum 10)
          </label>
          <ImageUploader onChange={setImages} maxFiles={10} />
          <p className="mt-1 text-sm text-gray-500">
            Ən azı 1 şəkil əlavə edin (ilk şəkil əsas şəkil kimi istifadə
            olunacaq)
          </p>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Geri
          </button>
          <button
            type="submit"
            disabled={status.loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 disabled:opacity-70"
          >
            {status.loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Yüklənir...</span>
              </>
            ) : (
              "Elanı Yerləşdir"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
