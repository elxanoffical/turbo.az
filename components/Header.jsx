"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

export default function Header() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // İlk user məlumatını götür
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUser();

    // Auth state change dinləyicisi
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          router.push("/login");
        } else if (event === "SIGNED_IN") {
          setUser(session.user);
        }
      }
    );

    // Cleanup
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  const profileLink =
    user?.app_metadata?.role === "admin"
      ? "/admin"
      : user
      ? "/profile"
      : "/login";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Artıq router.push("/login") burada lazım deyil,
    // çünki onAuthStateChange bunu edir
  };

  return (
    <header className="bg-[#00272b] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#e0FF4F]">
          AutoLux.az
        </Link>

        <nav className="flex gap-6 items-center text-sm">
          <Link href="/favorites" className="hover:underline">
            Favoritlər
          </Link>

          <Link
            href={profileLink}
            className="hover:underline flex items-center gap-1"
          >
            Profil
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="text-red-400 flex items-center gap-1 hover:underline"
            >
              <FiLogOut size={16} />
              Çıxış
            </button>
          ) : (
            <Link href="/login" className="hover:underline">
              Giriş
            </Link>
          )}

          <Link
            href="/add"
            className="bg-[#e0FF4F] text-black px-4 py-2 rounded hover:bg-yellow-400 transition duration-200"
          >
            Elan yerləşdir
          </Link>
        </nav>
      </div>
    </header>
  );
}
