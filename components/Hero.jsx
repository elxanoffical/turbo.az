"use client";
import React from "react";

export default function Hero() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <iframe
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        src="https://www.youtube.com/embed/OUPQGEwO6hA?autoplay=1&mute=1&controls=0&loop=1&playlist=OUPQGEwO6hA&modestbranding=1&showinfo=0&rel=0"
        title="Porsche Video"
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
      ></iframe>

      {/* Overlay with text */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Lüks Avtomobillər Burada
          </h1>
          <p className="text-white text-lg md:text-2xl drop-shadow-md">
            Keyfiyyətli avtomobilləri ən münasib qiymətlərlə tapın
          </p>
        </div>
      </div>
    </div>
  );
}
