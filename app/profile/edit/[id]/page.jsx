"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditAdPage() {
  const supabase = createClient();
  const router = useRouter();
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null });
  const [currentMainImage, setCurrentMainImage] = useState("");

  // Elan məlumatlarını yüklə
  useEffect(() => {
    const fetchAdData = async () => {
      setStatus({ loading: true, error: null });

      try {
        // 1. İstifadəçi yoxlaması
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("Giriş etməmisiniz");
        }

        // 2. Elan məlumatlarını gətir
        const { data: ad, error: adError } = await supabase
          .from("car_ads")
          .select("*, car_images(image_url)")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (adError || !ad) {
          throw new Error("Elan tapılmadı və ya redaktə hüququnuz yoxdur");
        }

        // 3. Formu doldur
        const formData = {
          ...ad,
          new: ad.new ? "true" : "false",
          barter: ad.barter ? "true" : "false",
        };

        Object.keys(formData).forEach((key) => {
          if (key !== "car_images") {
            setValue(key, formData[key]);
          }
        });

        // 4. Mövcud şəkilləri saxla
        if (ad.car_images) {
          setExistingImages(ad.car_images.map((img) => img.image_url));
        }

        // 5. Əsas şəkili saxla
        if (ad.main_image_url) {
          setCurrentMainImage(ad.main_image_url);
          setValue("main_image_url", ad.main_image_url);
        }

        setStatus({ loading: false, error: null });
      } catch (error) {
        setStatus({ loading: false, error: error.message });
        alert(error.message);
        router.push("/profile");
      }
    };

    fetchAdData();
  }, [id]);

  // Yeni şəkilləri yüklə
  const uploadNewImages = async (adId) => {
    if (!images || images.length === 0) return [];

    const uploadResults = [];

    for (const [index, file] of Array.from(images).entries()) {
      try {
        const fileName = `${Date.now()}_${file.name}`;

        // Şəkil yüklə
        const { error: uploadError } = await supabase.storage
          .from("car-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Public URL al
        const {
          data: { publicUrl },
        } = await supabase.storage.from("car-images").getPublicUrl(fileName);

        // Verilənlər bazasına yaz
        await supabase
          .from("car_images")
          .insert([{ car_ad_id: adId, image_url: publicUrl }]);

        uploadResults.push(publicUrl);
      } catch (error) {
        console.error(`Şəkil ${index + 1} xətası:`, error);
        uploadResults.push(null);
      }
    }

    return uploadResults.filter((url) => url !== null);
  };

  // Şəkil sil
  const deleteImage = async (imageUrl) => {
    try {
      const fileName = imageUrl.split("/").pop();

      // Storage-dan sil
      await supabase.storage.from("car-images").remove([fileName]);

      // Verilənlər bazasından sil
      await supabase.from("car_images").delete().eq("image_url", imageUrl);

      return true;
    } catch (error) {
      console.error("Şəkil silinmə xətası:", error);
      return false;
    }
  };

  // Form göndərildikdə
  const onSubmit = async (formData) => {
    setStatus({ loading: true, error: null });

    try {
      // 1. İstifadəçi yoxlaması
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Giriş etməmisiniz");
      }

      // 2. Yeni şəkilləri yüklə
      const newImageUrls = await uploadNewImages(id);

      // 3. Silinən şəkilləri təmizlə
      const imagesToKeep = existingImages.filter((img) =>
        formData.keep_images?.includes(img)
      );

      const imagesToDelete = existingImages.filter(
        (img) => !formData.keep_images?.includes(img)
      );

      for (const imgUrl of imagesToDelete) {
        await deleteImage(imgUrl);
      }

      // 4. Əsas şəkil URL-i təyin et
      let mainImageUrl = formData.main_image_url;
      if (!mainImageUrl) {
        mainImageUrl = newImageUrls[0] || imagesToKeep[0] || currentMainImage;
      }

      // 5. Elan məlumatlarını yenilə (CƏDVƏL STRUCTUR-UNA UYĞUN)
      const { error: updateError } = await supabase
        .from("car_ads")
        .update({
          city: formData.city,
          brand: formData.brand,
          model: formData.model,
          year: Number(formData.year),
          body: formData.body,
          color: formData.color,
          fuel: formData.fuel, // fuel_type əvəzinə fuel
          engine: formData.engine,
          mileage: formData.mileage ? Number(formData.mileage) : null,
          transmission: formData.transmission,
          drive: formData.drive,
          new: formData.new === "true",
          owners: formData.owners ? Number(formData.owners) : null,
          seats: formData.seats ? Number(formData.seats) : null,
          condition: formData.condition,
          market: formData.market,
          price: Number(formData.price),
          barter: formData.barter === "true",
          main_image_url: mainImageUrl,
          description: formData.description,
          is_public: false,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      console.log("formData.keep_images:", formData.keep_images);

      if (updateError) throw updateError;

      // 6. Uğurlu olduqda profilə yönləndir
      alert("Elan uğurla yeniləndi! Admin təsdiqindən sonra ictimai olacaq.");
      router.push("/profile");
    } catch (error) {
      setStatus({ loading: false, error: error.message });
      alert("Yeniləmə xətası: " + error.message);
    }
  };

  if (status.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Yüklənir...</span>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
          <p className="font-medium">Xəta baş verdi:</p>
          <p>{status.error}</p>
          <button
            onClick={() => router.push("/profile")}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Profilə qayıt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Elanı Redaktə Et</h1>

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
            name="fuel" // fuel_type əvəzinə fuel
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
          <FormSelect
            register={register}
            name="market"
            label="Bazar tipi"
            options={formOptions.markets}
            error={errors.market}
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

        {/* Mövcud şəkillər */}
        {existingImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Mövcud Şəkillər</h3>
            <div className="flex flex-wrap gap-4">
              {existingImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Mövcud şəkil ${index + 1}`}
                    className="w-32 h-32 object-cover rounded border-2 border-transparent transition-all"
                    style={{
                      borderColor:
                        watch("main_image_url") === url
                          ? "#3b82f6"
                          : "transparent",
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                    <label className="text-white text-sm flex items-center">
                      <input
                        type="checkbox"
                        {...register("keep_images")}
                        value={url}
                        defaultChecked
                        className="mr-1"
                      />
                      Saxla
                    </label>
                    <label className="text-white text-sm flex items-center justify-end">
                      <input
                        type="radio"
                        {...register("main_image_url")}
                        value={url}
                        defaultChecked={url === currentMainImage}
                        className="mr-1"
                      />
                      Əsas şəkil
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yeni şəkillər */}
        <div>
          <label className="block mb-2 font-medium">
            Yeni Şəkillər Əlavə Et (Maksimum {10 - existingImages.length})
          </label>
          <ImageUploader
            onChange={setImages}
            maxFiles={10 - existingImages.length}
          />
        </div>

        {/* Ətraflı məlumat */}
        <div>
          <label className="block mb-2 font-medium">Ətraflı Məlumat</label>
          <textarea
            {...register("description")}
            rows={5}
            className="w-full border rounded p-2"
            placeholder="Maşın haqqında ətraflı məlumat..."
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            İmtina Et
          </button>
          <button
            type="submit"
            disabled={status.loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 disabled:opacity-70"
          >
            {status.loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Yenilənir...</span>
              </>
            ) : (
              "Yenilə"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
