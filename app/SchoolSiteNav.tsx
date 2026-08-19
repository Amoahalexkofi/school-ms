"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

interface NavProps {
  name: string;
  logo?: string | null;
  initials: string;
  color: string;
  hasNotices: boolean;
}

const NAV_LINKS = [
  { href: "#home",    label: "Home"    },
  { href: "#about",   label: "About"   },
  { href: "#notices", label: "Notices" },
  { href: "#contact", label: "Contact" },
];

export function SchoolSiteNav({ name, logo, initials, color, hasNotices }: NavProps) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const links = hasNotices ? NAV_LINKS : NAV_LINKS.filter(l => l.href !== "#notices");

  return (
    <>
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-shadow duration-200"
        style={{
          background: `color-mix(in srgb, ${color} 22%, #0d1424)`,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.18)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {logo ? (
              <img src={logo} alt={name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[12px] shrink-0"
                style={{ background: color }}
              >
                {initials}
              </div>
            )}
            <span className="font-semibold text-[14.5px] leading-tight tracking-tight text-white hidden sm:block">
              {name}
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[13.5px] font-medium px-3.5 py-2 rounded-lg transition-all text-white/85 hover:text-white hover:bg-white/10"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Sign in + hamburger */}
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="group hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-xl font-medium text-[13.5px] transition-all shrink-0 text-white bg-transparent border border-white/35 hover:bg-white/10 hover:border-white/50"
            >
              Sign In <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-white hover:bg-white/10"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 flex flex-col transition-opacity duration-200 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: `color-mix(in srgb, ${color} 22%, #0d1424)`, backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center justify-between px-6 h-[60px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[12px]" style={{ background: color }}>
              {initials}
            </div>
            <span className="text-white font-semibold text-[14.5px]">{name}</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 gap-1">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-[26px] font-light text-white/85 hover:text-white py-2.5 transition-colors tracking-tight"
            >
              {label}
            </a>
          ))}
          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="group inline-flex items-center gap-2 text-white font-medium px-6 py-3.5 rounded-xl text-[14.5px] transition-all hover:brightness-110"
              style={{ background: color }}
            >
              Sign In to Portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="px-8 pb-8 text-white/30 text-[12px]">
          Powered by Skula · a Novalss product
        </div>
      </div>
    </>
  );
}
