// app/profile/page.jsx
import { createServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import AdCard from "@/components/AdCard";

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: ads, error } = await supabase
    .from("car_ads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return <p className="p-4 text-red-500">Elanlar yüklənmədi.</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profilimdəki Elanlar ({ads.length})</h1>

      {ads.length === 0 ? (
        <p className="text-gray-500">Sizin heç bir elanınız yoxdur.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
}
