"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, X, Menu } from "lucide-react";

export function SkulaNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links: [string, string][] = [
    ["Features",     "#features"],
    ["Solutions",    "#solutions"],
    ["Pricing",      "#pricing"],
    ["All Features", "/features"],
    ["Contact",      "/contact"],
  ];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
      scrolled ? "bg-white/95 backdrop-blur-xl border-b border-slate-900/[0.06]" : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/images/skula-logo.png" alt="Skula" className="h-9 object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          {links.map(([l, h]) => (
            <a key={l} href={h}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100/70 transition-all">
              {l}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/demo"
            className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100/70 transition-all">
            View Demo
          </Link>
          <Link href="/contact"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)" }}>
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600"
          onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 top-[60px] bg-slate-900/20 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="md:hidden absolute inset-x-0 top-full z-50 mx-3 mt-1.5 bg-white rounded-2xl border border-slate-900/[0.07] overflow-hidden"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <div className="p-2">
                {links.map(([label, href]) => (
                  <a key={label} href={href} onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    {label}
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </a>
                ))}
              </div>
              <div className="border-t border-slate-100 p-3 flex flex-col gap-2">
                <Link href="/demo" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center h-11 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  View Demo
                </Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-900 text-white text-[14px] font-bold transition-colors">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
