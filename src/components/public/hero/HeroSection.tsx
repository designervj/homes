"use client";

import { useState, useEffect } from "react";
import { BadgeCheck } from "lucide-react";
import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import { cn } from "@/lib/utils";

const SLIDES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09be15e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background Slider */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide}
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
            index === current ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url(${slide})` }}
        />
      ))}
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
      <div className="absolute inset-0 bg-grid-pattern opacity-50 mix-blend-overlay" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Text & Stats */}
          <div className="lg:col-span-7 xl:col-span-6">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-primary font-medium">RERA Verified Properties</span>
              </div>
              <div className="w-12 h-px bg-primary/30" />
              <span className="text-xs text-muted-foreground font-medium">Lucknow, Uttar Pradesh</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-foreground mb-6 animate-fade-in-up delay-100">
              Find Your <br className="hidden sm:block" />
              <span className="text-gradient-primary italic">Perfect</span>
              <br className="hidden sm:block" /> Property in Lucknow
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-12 animate-fade-in-up delay-200">
              Trusted real estate consultancy connecting buyers with verified residential plots, premium villas, and modern apartments — with full legal transparency.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 animate-fade-in-up delay-300">
              {[
                { num: "500+", label: "Families Served" },
                { num: "7",    label: "Active Projects" },
                { num: "100%", label: "RERA Verified" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="font-serif text-3xl font-semibold text-foreground">{stat.num}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
            
            {/* Slide Indicators */}
            <div className="flex gap-2 mt-12 animate-fade-in-up delay-400">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "w-8 h-1 rounded-full transition-all duration-300",
                    i === current ? "bg-primary" : "bg-primary/20"
                  )}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Enquiry Form */}
          <div className="lg:col-span-5 xl:col-span-4 xl:col-start-9 animate-fade-in-up delay-400">
            <div className="bg-card/60 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="font-serif text-2xl font-medium text-foreground mb-2">Interested?</h3>
                <p className="text-sm text-muted-foreground">Drop your details and we&apos;ll get back with the best matching properties.</p>
              </div>
              <EnquiryForm variant="sidebar" className="[&_label_span]:text-muted-foreground [&_label:hover_span]:text-foreground" />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
