import React from "react";

const VIDEO_URL =
  "https://res.cloudinary.com/dosk8wyqj/video/upload/v1763225553/WhatsApp_Video_2025-11-15_at_13.29.30_jksuoi.mp4";

const Hero = () => {
  return (
    <section
      className="w-full flex flex-col overflow-hidden bg-[#FAFAFA]"
      aria-label="Seção Hero em vídeo"
    >
      <div className="relative w-full h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] flex items-center justify-center rounded-3xl overflow-hidden shadow-xl border border-gray-200">
        <video
          src={VIDEO_URL}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </section>
  );
};

export default Hero;
