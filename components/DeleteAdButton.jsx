"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function DeleteAdButton({ adId }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (confirm("Bu elanı silmək istədiyinizə əminsiniz?")) {
      try {
        // Şəkilləri sil
        const { data: images } = await supabase
          .from("car_images")
          .select("image_url")
          .eq("car_ad_id", adId);

        if (images?.length > 0) {
          const filesToDelete = images.map(img =>
            img.image_url.split('/').pop()
          );
          await supabase.storage.from("car-images").remove(filesToDelete);
        }

        // Elanı sil
        const { error } = await supabase
          .from("car_ads")
          .delete()
          .eq("id", adId);

        if (error) throw error;

        router.push("/profile");
        router.refresh();
      } catch (error) {
        alert("Silinmə xətası: " + error.message);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
    >
      Sil
    </button>
  );
}