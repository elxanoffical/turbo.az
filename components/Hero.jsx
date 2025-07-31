"use client";
import React, { useRef } from "react";

export default function Hero() {
  const videoRef = useRef(null);

  const handleUnmute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 0.3; // 0.0 - 1.0 arası səviyyə
      video.play();
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden cursor-pointer"
      onClick={handleUnmute}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {/* Overlay with text */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-white text-5xl font-light tracking-wider uppercase mb-2">
            Drive the Dream
          </h1>
          <p className="text-white text-xl font-thin">
            Luxury. Power. Prestige.
          </p>  
        </div>  
      </div>
    </div>
  );
}
