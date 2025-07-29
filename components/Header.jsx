// components/Header.tsx
"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#1c1c1c] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#d10024]">
          AutoLux.az
        </Link>

        <nav className="flex gap-6 items-center text-sm">
          <Link href="/favorites" className="hover:underline">
            Favoritlər
          </Link>
          <Link href="/login" className="hover:underline">
            Giriş
          </Link>
          <Link
            href="/create"
            className="bg-[#d10024] text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Elan yerləşdir
          </Link>
        </nav>
      </div>
    </header>
  );
}
