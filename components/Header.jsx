// components/Header.tsx
"use client";

import Link from "next/link";

export default function Header() {
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
          <Link href="/login" className="hover:underline">
            Giriş
          </Link>
          <Link
            href="/create"
            className="bg-[#e0FF4F] text-black px-4 py-2 rounded hover:bg-yellow-400 transition duration-200"
          >
            Elan yerləşdir
          </Link>
        </nav>
      </div>
    </header>
  );
}
