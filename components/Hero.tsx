"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
}

const Hero = ({ className }: HeroProps) => {
  return (
    <section className={cn("relative w-full h-[500px] md:h-[600px] overflow-hidden", className)}>
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/assets/mountains.jpg"
          alt="Beautiful mountain lake view"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white pt-16 px-4">
        <h2 className="text-lg md:text-xl font-medium mb-2">Helping Others</h2>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-wide mb-6">
          LIVE & TRAVEL
        </h1>
        
        <p className="text-lg md:text-xl max-w-xl">
          Special offers to suit your plan
        </p>
      </div>
    </section>
  );
};

export default Hero; 