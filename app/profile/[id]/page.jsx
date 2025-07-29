import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from 'next/headers';
import { notFound } from "next/navigation";
import Link from 'next/link';
import AdDetailClient from "@/components/AdDetailClient";

export default async function AdDetailPage({ params }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { id } = params;

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Giriş etməmisiniz");

    const { data: ad, error: adError } = await supabase
      .from("car_ads")
      .select("*, car_images(image_url)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (adError || !ad) return notFound();

    const allImages = [
      ad.main_image_url,
      ...(ad.car_images?.map(img => img.image_url) || [])
    ].filter(Boolean);

    return <AdDetailClient ad={ad} allImages={allImages} />;
  } catch (error) {
    console.error("Error in AdDetailPage:", error);
    return notFound();
  }
}
