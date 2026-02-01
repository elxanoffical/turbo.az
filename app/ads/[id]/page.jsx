import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AdDetailClient from "@/components/AdDetailClient";

export default async function AdDetailPage({ params }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);
  const { id } = resolvedParams;

  const { data: ad, error } = await supabase
    .from("car_ads")
    .select("*, car_images(image_url)")
    .eq("id", id)
    .single();

  if (error || !ad) return notFound();

  const allImages = [
    ad.main_image_url,
    ...(ad.car_images?.map((img) => img.image_url) || []),
  ].filter(Boolean);

  return <AdDetailClient ad={ad} allImages={allImages} />;
}
