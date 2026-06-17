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
  "linear-gradient(135deg, #0c1a0a 0%, #14532d 50%, #15803d 100%)",
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
          { id: "d1", title: `Welcome to\n${schoolName}`, subtitle: motto ?? "Nurturing minds. Building futures.", ctaText: "Explore Portal", ctaLink: "/sign-in", gradient: GRADIENTS[0] },
          { id: "d2", title: "Excellence in\nEducation", subtitle: "Where every student is empowered to reach their fullest potential.", ctaText: "About Us", ctaLink: "#about", gradient: GRADIENTS[1] },
          { id: "d3", title: "Admissions\nNow Open", subtitle: "Join a thriving school community. Applications welcome.", ctaText: "Contact Us", ctaLink: "#contact", gradient: GRADIENTS[2] },
        ];

  const [idx, setIdx]     = useState(0);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);

  const go = useCallback((next: number) => {
    setFading(true);
    setTimeout(() => { setIdx(next); setFading(false); }, 350);
  }, []);

  const prev = useCallback(() => go((idx - 1 + display.length) % display.length), [go, idx, display.length]);
  const next = useCallback(() => go((idx + 1) % display.length), [go, idx, display.length]);

  useEffect(() => {
    if (paused || display.length <= 1) return;
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [paused, next, display.length]);

  const slide = display[idx];
  const isImg = !!slide.imageUrl;
  const titleLines = slide.title.split("\n");

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden"
      style={{ height: "100dvh", minHeight: 600 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide backgrounds — layered for smooth cross-fade */}
      {display.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === idx ? 1 : 0,
            background: s.imageUrl ? undefined : ((s as any).gradient ?? GRADIENTS[i % GRADIENTS.length]),
            backgroundImage: s.imageUrl ? `url(${s.imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Image overlay */}
      {isImg && <div className="absolute inset-0 bg-slate-900/60" />}

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 80%, ${primaryColor}25 0%, transparent 70%)` }}
      />

      {/* Content — centred, padded for fixed nav (64px) */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center h-full px-5 pt-16 transition-opacity duration-350"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <div className="max-w-4xl w-full">
          {/* School chip */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white/90 text-[11px] font-bold px-4 py-1.5 rounded-full mb-7 uppercase tracking-[0.15em]">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: primaryColor }} />
            {schoolName}
          </div>

          {/* Headline */}
          <h1
            className="text-white font-black leading-[1.05] tracking-tight mb-5"
            style={{ fontSize: "clamp(38px, 6vw, 80px)" }}
          >
            {titleLines.map((line, i) => (
              <span key={i} className={i > 0 ? "block" : undefined}>
                {i > 0 && line}
                {i === 0 && line}
              </span>
            ))}
          </h1>

          {slide.subtitle && (
            <p
              className="text-white/72 leading-relaxed max-w-xl mx-auto mb-10"
              style={{ fontSize: "clamp(15px, 1.8vw, 20px)" }}
            >
              {slide.subtitle}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={slide.ctaLink}
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl text-[15px] transition-all hover:scale-105 active:scale-95"
              style={{ background: primaryColor, boxShadow: `0 4px 28px ${primaryColor}70` }}
            >
              {slide.ctaText}
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 bg-white/12 border border-white/25 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-2xl text-[15px] transition-all hover:bg-white/20"
            >
              Staff / Parent Login
            </Link>
          </div>
        </div>
      </div>

      {/* Side arrows */}
      {display.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {display.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {display.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all duration-400"
              style={{
                width: i === idx ? 28 : 8,
                height: 8,
                background: i === idx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      )}

      {/* Scroll cue */}
      <div className="absolute bottom-8 right-6 z-20 hidden md:flex flex-col items-center gap-2 text-white/40">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30" />
        <span className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ writingMode: "vertical-rl" }}>scroll</span>
      </div>
    </section>
  );
}
