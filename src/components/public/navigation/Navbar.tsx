"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronDown, Menu, X, MapPin,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

// ─── PROJECTS DATA ────────────────────────────────────────────────────────────

const PROJECTS = [
  { name: "Okas Enclave",          slug: "okas-enclave",          type: "Plots",     location: "Sushant Golf City" },
  { name: "Attalika Palms",        slug: "attalika-palms",        type: "Villas",    location: "Pursaini, Lucknow" },
  { name: "Stellar Okas Golf View",slug: "stellar-okas-golf-view",type: "Plots",     location: "Sushant Golf City" },
  { name: "Kailasha Enclave",      slug: "kailasha-enclave",      type: "Plots",     location: "Sultanpur Road" },
  { name: "Greenberry Signature",  slug: "greenberry-signature",  type: "Apartments",location: "Vrindavan Yojana" },
  { name: "Lavanya Enclave",       slug: "lavanya-enclave",       type: "Apts & Plots",location: "Amar Shaheed Path" },
  { name: "Vikas Vihar",           slug: "vikas-vihar",           type: "Mixed",     location: "Lucknow" },
];

const NAV_LINKS = [
  { href: "/",        label: "Home" },
  { href: "/about",   label: "About" },
  { href: "/services",label: "Services" },
  { href: "/blogs",   label: "Blogs" },
  { href: "/contact", label: "Contact" },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const dropdownRef                        = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/homes/Homes-Logo.webp"
              alt="Homes Logo"
              width={140}
              height={44}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className={cn("px-3 py-2 text-sm rounded-lg transition-colors", pathname === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              Home
            </Link>
            <Link href="/about" className={cn("px-3 py-2 text-sm rounded-lg transition-colors", pathname === "/about" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              About
            </Link>

            {/* Projects dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors",
                  pathname.startsWith("/projects") ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                Projects
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[340px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-2">
                    {PROJECTS.map((project) => (
                      <Link
                        key={project.slug}
                        href={`/projects/${project.slug}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/80 transition-colors group"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary-light transition-colors truncate">
                            {project.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-md">
                              {project.type}
                            </span>
                            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                              <MapPin className="w-2.5 h-2.5" /> {project.location}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border p-2">
                    <Link
                      href="/projects"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-primary hover:text-primary-light hover:bg-primary/5 rounded-xl transition-colors font-medium"
                    >
                      View All Projects →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/services" className={cn("px-3 py-2 text-sm rounded-lg transition-colors", pathname === "/services" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              Services
            </Link>
            <Link href="/blogs" className={cn("px-3 py-2 text-sm rounded-lg transition-colors", pathname === "/blogs" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              Blogs
            </Link>
            <Link href="/contact" className={cn("px-3 py-2 text-sm rounded-lg transition-colors", pathname === "/contact" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              Contact
            </Link>
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden lg:inline-flex" />
            <Link
              href="/#enquire"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-foreground text-sm font-semibold rounded-lg transition-colors"
            >
              Book Site Visit
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/98 backdrop-blur-xl flex flex-col pt-16">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            <div className="px-4 pb-3">
              <ThemeToggle />
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest px-4 mb-2">Projects</p>
              {PROJECTS.map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-border">
            <Link
              href="/#enquire"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary hover:bg-primary-light text-foreground font-semibold rounded-xl transition-colors"
            >
              Book Site Visit
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
