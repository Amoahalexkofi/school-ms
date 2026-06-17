"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, GraduationCap } from "lucide-react";

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

  const links = hasNotices ? NAV_LINKS : NAV_LINKS.filter(l => l.href !== "#notices");

  return (
    <>
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={
          scrolled
            ? { background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", boxShadow: "0 1px 0 #e2e8f0, 0 2px 16px rgba(0,0,0,0.06)" }
            : { background: "transparent" }
        }
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {logo ? (
              <img src={logo} alt={name} className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-[13px] shrink-0 transition-all"
                style={{ background: color }}
              >
                {initials}
              </div>
            )}
            <span
              className={`font-black text-[15px] leading-tight tracking-tight transition-colors hidden sm:block ${scrolled ? "text-slate-900" : "text-white"}`}
            >
              {name}
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                  scrolled
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Sign in + hamburger */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-xl font-bold text-[13px] transition-all hover:opacity-90 active:scale-95 shrink-0"
              style={
                scrolled
                  ? { background: color, color: "#fff" }
                  : { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", backdropFilter: "blur(8px)" }
              }
            >
              Sign In <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className={`lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 flex flex-col transition-all duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-[13px]" style={{ background: color }}>
              {initials}
            </div>
            <span className="text-white font-black text-[15px]">{name}</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 gap-2">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-[28px] font-black text-white/80 hover:text-white py-3 transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-2 text-white font-bold px-6 py-3.5 rounded-2xl text-[15px] transition-all hover:opacity-90"
              style={{ background: color }}
            >
              Sign In to Portal <ArrowRight className="h-4 w-4" />
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
