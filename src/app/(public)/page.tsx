import Link from "next/link";
import { Building2, CalendarCheck, BadgeCheck, MapPin, ArrowRight } from "lucide-react";
import { getFeaturedProperties } from "@/lib/db/actions/property.actions";
import { PropertyCard } from "@/components/public/properties/PropertyCard";
import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import { HeroSearch } from "@/components/public/hero/HeroSearch";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homes — Premium Real Estate Advisory in Lucknow",
  description:
    "Discover RERA-verified residential plots, villas, and apartments in Lucknow. Expert advisory, transparent pricing, and hassle-free site visits.",
};

export default async function HomePage() {
  const featuredRes = await getFeaturedProperties(4);
  const featured = featuredRes.data ?? [];

  return (
    <div className="bg-[#0B1521]">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1521] via-[#0B1521]/95 to-[#0B1521]" />
        <div
          className="absolute right-0 top-1/4 w-[700px] h-[700px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: "radial-gradient(circle, #C9A96E 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
              <div className="flex items-center gap-2 bg-[#C9A96E]/10 border border-[#C9A96E]/20 px-3 py-1.5 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-[#C9A96E] font-medium">RERA Verified Properties</span>
              </div>
              <div className="w-12 h-px bg-[#C9A96E]/30" />
              <span className="text-xs text-[#5A7080]">Lucknow, Uttar Pradesh</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-medium leading-[1.08] tracking-tight text-white mb-6 animate-fade-in-up delay-100">
              Find Your{" "}
              <span className="text-gradient-gold italic">Perfect</span>
              <br />
              Property in Lucknow
            </h1>

            <p className="text-lg text-[#8A9BAE] leading-relaxed max-w-xl mb-10 animate-fade-in-up delay-200">
              Trusted real estate consultancy connecting buyers with verified residential plots, premium villas, and modern apartments — with full legal transparency.
            </p>

            {/* Search bar */}
            <div className="animate-fade-in-up delay-300">
              <HeroSearch />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10 animate-fade-in-up delay-400">
              {[
                { num: "500+", label: "Families Served" },
                { num: "7",    label: "Active Projects" },
                { num: "100%", label: "RERA Verified" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="font-serif text-3xl font-semibold text-white">{stat.num}</span>
                  <span className="text-xs text-[#5A7080]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse-slow">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#C9A96E]/40" />
          <div className="w-1 h-1 rounded-full bg-[#C9A96E]/40" />
        </div>
      </section>

      {/* ── FEATURED PROJECTS ─────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-px bg-[#C9A96E]" />
              <span className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium">Our Portfolio</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium text-white">Featured Projects</h2>
            <p className="text-[#5A7080] mt-3 max-w-md">
              Handpicked residential developments across Lucknow&apos;s prime corridors — all RERA registered.
            </p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-2 text-sm text-[#C9A96E] hover:text-[#E2C99A] border border-[#C9A96E]/20 hover:border-[#C9A96E]/40 px-4 py-2.5 rounded-xl transition-all"
          >
            View All Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((property, i) => (
              <PropertyCard
                key={property._id}
                property={property}
                featured={i === 0}
                className={i === 0 ? "md:col-span-2" : ""}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Skeleton placeholders */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#12202E] border border-white/[0.06] rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        )}
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-7 h-px bg-[#C9A96E]" />
              <span className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium">What We Do</span>
              <div className="w-7 h-px bg-[#C9A96E]" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium text-white mb-4">
              End-to-End Advisory
            </h2>
            <p className="text-[#5A7080] max-w-lg mx-auto">
              From shortlisting to key handover — we manage every step so you can focus on your decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                num: "01",
                title: "Buy Property",
                desc: "Filter verified properties by location, type, and budget. Every listing includes RERA ID, pricing, and legal clearance status — no hidden information.",
                cta: "Explore Listings",
                href: "/projects",
              },
              {
                icon: CalendarCheck,
                num: "02",
                title: "Schedule Site Visit",
                desc: "Book a guided property walkthrough at a time that suits you. Our agents manage the logistics — transport, entry, and documentation.",
                cta: "Book a Slot",
                href: "/#enquire",
              },
              {
                icon: BadgeCheck,
                num: "03",
                title: "Loan Advisory",
                desc: "Access fair, unbiased home loan guidance from partner banks. We compare rates, process documents, and accelerate approvals without upfront fees.",
                cta: "Check Eligibility",
                href: "/#enquire",
              },
            ].map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.num}
                  className="relative group bg-[#12202E] border border-white/[0.06] hover:border-[#C9A96E]/25 rounded-2xl p-8 transition-all duration-300 overflow-hidden"
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/0 to-transparent group-hover:via-[#C9A96E]/40 transition-all duration-500" />

                  <div className="w-12 h-12 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5 text-[#C9A96E]" />
                  </div>
                  <p className="text-[10px] text-[#3A5060] uppercase tracking-widest mb-2">{service.num}</p>
                  <h3 className="font-serif text-2xl font-medium text-white mb-3">{service.title}</h3>
                  <p className="text-sm text-[#5A7080] leading-relaxed mb-6">{service.desc}</p>
                  <Link
                    href={service.href}
                    className="flex items-center gap-2 text-sm text-[#C9A96E] group-hover:text-[#E2C99A] transition-colors font-medium"
                  >
                    {service.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GOLD STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-[#C9A96E] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { num: "500+", label: "Families Served Across UP" },
              { num: "7",    label: "RERA Verified Projects" },
              { num: "5★",   label: "Average Client Rating" },
              { num: "48h",  label: "Avg. Site Visit Response" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-4xl sm:text-5xl font-semibold text-[#0B1521] mb-2">{stat.num}</p>
                <p className="text-sm font-medium text-[#0B1521]/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / COMPLIANCE ────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-px bg-[#C9A96E]" />
              <span className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium">Why Homes</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium text-white mb-5">
              Built on Transparency<br />
              <span className="text-gradient-gold italic">and Compliance</span>
            </h2>
            <p className="text-[#5A7080] mb-8 leading-relaxed">
              Every property listed on our platform goes through a structured verification process. We believe that buyers deserve full legal clarity before committing to any transaction.
            </p>

            <div className="space-y-4">
              {[
                { title: "RERA Registration Verified", desc: "Every project carries its UP-RERA registration number, directly linked to the regulatory database." },
                { title: "Title & Legal Clearance",     desc: "Encumbrance status, occupancy certificates, and land-use documents reviewed before listing." },
                { title: "Bank-Approved Projects",      desc: "Listings include loan eligibility — SBI, HDFC, ICICI — reducing financing friction." },
                { title: "Transparent Pricing",         desc: "Base price, price per sqft, stamp duty estimates, and GST shown upfront — no hidden costs." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-[#12202E] border border-white/[0.06] rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">{item.title}</p>
                    <p className="text-xs text-[#5A7080] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Process steps */}
          <div className="relative pl-6">
            <div className="absolute left-[11px] top-6 bottom-6 w-px bg-gradient-to-b from-[#C9A96E]/40 via-[#C9A96E]/20 to-transparent" />
            <div className="space-y-8">
              {[
                { n: "1", title: "Share Your Requirements",    desc: "Tell us your location, budget, and property type preference." },
                { n: "2", title: "Get Curated Options",        desc: "We match you with verified properties that fit your exact criteria." },
                { n: "3", title: "Schedule a Site Visit",      desc: "We arrange and escort you through the property walkthrough." },
                { n: "4", title: "Close & Register",           desc: "We assist with documentation, loan processing, and final registration." },
              ].map((step) => (
                <div key={step.n} className="flex gap-5">
                  <div className="w-6 h-6 rounded-full bg-[#12202E] border border-[#C9A96E]/40 flex items-center justify-center flex-shrink-0 z-10">
                    <span className="font-serif text-sm font-medium text-[#C9A96E]">{step.n}</span>
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium text-white mb-1">{step.title}</p>
                    <p className="text-xs text-[#5A7080] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ENQUIRY CTA ───────────────────────────────────────────────────────── */}
      <section id="enquire" className="py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left copy */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-px bg-[#C9A96E]" />
                <span className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium">Get In Touch</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-white mb-5">
                Talk to a Property<br />Expert Today
              </h2>
              <p className="text-[#5A7080] mb-10 leading-relaxed">
                Tell us what you&apos;re looking for. Our advisors will match you with verified properties and arrange a site visit within 48 hours.
              </p>

              <div className="space-y-5">
                {[
                  { icon: Building2,     label: "CALL US",  value: "+91 88746 25303",        href: "tel:+918874625303" },
                  { icon: BadgeCheck,    label: "EMAIL",    value: "info@homes.in",           href: "mailto:info@homes.in" },
                  { icon: MapPin,        label: "OFFICE",   value: "Royal Plaza, Sushant Golf City, Sultanpur Road, Lucknow", href: null },
                ].map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4.5 h-4.5 text-[#C9A96E]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#3A5060] uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm text-white mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  );
                  return item.href ? (
                    <a key={item.label} href={item.href} className="block hover:opacity-80 transition-opacity">{content}</a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* Form card */}
            <div className="bg-[#12202E] border border-white/[0.08] rounded-2xl p-8">
              <h3 className="font-serif text-xl font-medium text-white mb-6">Send an Enquiry</h3>

              {/* Property selector */}
              <div className="mb-4">
                <select className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3.5 py-2.5 text-sm text-[#8A9BAE] outline-none focus:border-[#C9A96E]/50 transition-all">
                  <option value="">Interested in a specific project?</option>
                  {["Okas Enclave","Attalika Palms","Stellar Okas Golf View","Kailasha Enclave","Greenberry Signature","Lavanya Enclave","Vikas Vihar"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <EnquiryForm variant="inline" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
