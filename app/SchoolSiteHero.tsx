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
}

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
          { id: "d1", title: `Welcome to\n${schoolName}`, subtitle: motto ?? "Nurturing minds. Building futures.", ctaText: "Explore Portal", ctaLink: "/sign-in" },
          { id: "d2", title: "Excellence in\nEducation", subtitle: "Where every student is empowered to reach their fullest potential.", ctaText: "About Us", ctaLink: "#about" },
          { id: "d3", title: "Admissions\nNow Open", subtitle: "Join a thriving school community. Applications welcome.", ctaText: "Contact Us", ctaLink: "#contact" },
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

  // Deep, brand-coherent fallback (no photo set) — derived from the school's
  // own color rather than an unrelated stock gradient, so every school's
  // hero reads as "their" color, just as the marketing site's hero reads
  // indigo. color-mix keeps this a one-line derivation per school.
  const deepTone = `color-mix(in srgb, ${primaryColor} 78%, #0d1424)`;

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden"
      style={{ height: "88vh", minHeight: 560 }}
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
            background: s.imageUrl ? undefined : `linear-gradient(160deg, ${deepTone} 0%, #0d1424 115%)`,
            backgroundImage: s.imageUrl ? `url(${s.imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Image overlay — legibility for real photos */}
      {isImg && <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(13,20,36,0.55) 0%, rgba(13,20,36,0.75) 100%)" }} />}

      {/* Radial glow, tinted to the school's own color */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 55% at 50% 15%, ${primaryColor}35 0%, transparent 65%)` }}
      />

      {/* Content — centred, padded for fixed nav (60px) */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center h-full px-5 pt-14 transition-opacity duration-350"
        style={{ opacity: fading ? 0 : 1, maxWidth: "100vw" }}
      >
        <div className="max-w-3xl w-full min-w-0">
          {/* School chip */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white/90 text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-7 uppercase tracking-[0.14em]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: primaryColor }} />
            {schoolName}
          </div>

          {/* Headline */}
          <h1
            className="text-white font-light leading-[1.08] tracking-[-0.025em] mb-5 break-words"
            style={{ fontSize: "clamp(34px, 5.5vw, 64px)", maxWidth: "100%" }}
          >
            {titleLines.map((line, i) => (
              <span key={i} className={i > 0 ? "block" : undefined}>
                {line}
              </span>
            ))}
          </h1>

          {slide.subtitle && (
            <p
              className="text-white/70 leading-relaxed max-w-lg mx-auto mb-9"
              style={{ fontSize: "clamp(14.5px, 1.6vw, 17px)" }}
            >
              {slide.subtitle}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-xs sm:max-w-none mx-auto">
            <Link
              href={slide.ctaLink}
              className="inline-flex items-center justify-center gap-2 text-white font-medium px-7 py-3.5 rounded-full text-[14.5px] transition-all hover:brightness-110 active:scale-[0.98] whitespace-nowrap"
              style={{ background: primaryColor, boxShadow: `0 4px 24px ${primaryColor}55` }}
            >
              {slide.ctaText}
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/22 backdrop-blur-sm text-white font-medium px-7 py-3.5 rounded-full text-[14.5px] transition-all hover:bg-white/18 whitespace-nowrap"
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
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/18 text-white backdrop-blur-sm hover:bg-white/18 transition-all flex items-center justify-center"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/18 text-white backdrop-blur-sm hover:bg-white/18 transition-all flex items-center justify-center"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {display.length > 1 && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {display.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all duration-400"
              style={{
                width: i === idx ? 22 : 6,
                height: 6,
                background: i === idx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.32)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
