"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Slide {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  ctaText: string;
  ctaLink: string;
  gradient?: string;
}

const GRADIENTS = [
  "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
  "linear-gradient(135deg, #0f172a 0%, #164e63 50%, #0e7490 100%)",
  "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)",
  "linear-gradient(135deg, #1a0533 0%, #3b0764 50%, #6d28d9 100%)",
  "linear-gradient(135deg, #0c0a09 0%, #1c1917 40%, #44403c 100%)",
];

export function SchoolSiteHero({
  slides,
  schoolName,
  motto,
  primaryColor,
}: {
  slides: Slide[];
  schoolName: string;
  motto?: string | null;
  primaryColor: string;
}) {
  const display: Slide[] =
    slides.length > 0
      ? slides
      : [
          { id: "d1", title: `Welcome to ${schoolName}`, subtitle: motto ?? "Nurturing minds. Building futures.", ctaText: "Sign In to Portal", ctaLink: "/sign-in", gradient: GRADIENTS[0] },
          { id: "d2", title: "Excellence in Education", subtitle: "Where every student is empowered to reach their fullest potential.", ctaText: "Learn More", ctaLink: "#about", gradient: GRADIENTS[1] },
          { id: "d3", title: "Admissions Now Open", subtitle: "Join a school community that puts learners first. Apply today.", ctaText: "Contact Us", ctaLink: "#contact", gradient: GRADIENTS[2] },
        ];

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setIdx(next); setAnimating(false); }, 300);
  }, [animating]);

  const prev = useCallback(() => go((idx - 1 + display.length) % display.length), [go, idx, display.length]);
  const next = useCallback(() => go((idx + 1) % display.length), [go, idx, display.length]);

  useEffect(() => {
    if (paused || display.length <= 1) return;
    const t = setInterval(next, 6500);
    return () => clearInterval(t);
  }, [paused, next, display.length]);

  const slide = display[idx];
  const isImg = !!slide.imageUrl;

  return (
    <section
      id="home"
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: "100svh" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      {display.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: i === idx ? 1 : 0,
            background: s.imageUrl ? undefined : ((s as any).gradient ?? GRADIENTS[i % GRADIENTS.length]),
            backgroundImage: s.imageUrl ? `url(${s.imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Dark overlay for images */}
      {isImg && <div className="absolute inset-0 bg-black/55" />}

      {/* Subtle dot texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow accent */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${primaryColor}30 0%, transparent 70%)` }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto transition-opacity duration-300"
        style={{ opacity: animating ? 0 : 1 }}
      >
        {/* School chip */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white/90 text-[11px] font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: primaryColor }} />
          {schoolName}
        </div>

        <h1
          className="text-white font-black leading-[1.06] tracking-tight mb-5"
          style={{ fontSize: "clamp(36px, 5.5vw, 76px)" }}
        >
          {slide.title}
        </h1>

        {slide.subtitle && (
          <p
            className="text-white/75 leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ fontSize: "clamp(16px, 1.8vw, 22px)" }}
          >
            {slide.subtitle}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href={slide.ctaLink}
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 text-[15px] active:scale-95"
            style={{ background: primaryColor, boxShadow: `0 4px 24px ${primaryColor}80` }}
          >
            {slide.ctaText}
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:bg-white/20 text-[15px]"
          >
            Staff / Parent Login
          </Link>
        </div>
      </div>

      {/* Arrows */}
      {display.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Slide dots */}
      {display.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {display.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 28 : 8,
                height: 8,
                background: i === idx ? primaryColor : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      )}

      {/* Scroll hint */}
      <div className="absolute bottom-10 right-8 z-20 hidden md:flex flex-col items-center gap-1.5 text-white/40">
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase rotate-90 translate-y-2">scroll</span>
        <div className="w-px h-10 bg-white/20" />
      </div>
    </section>
  );
}
