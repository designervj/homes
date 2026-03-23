import Link from "next/link";
import { Building2, Phone, Mail, MapPin } from "lucide-react";

const PROJECTS = [
  { name: "Okas Enclave",           slug: "okas-enclave" },
  { name: "Attalika Palms",         slug: "attalika-palms" },
  { name: "Stellar Okas Golf View", slug: "stellar-okas-golf-view" },
  { name: "Kailasha Enclave",       slug: "kailasha-enclave" },
  { name: "Greenberry Signature",   slug: "greenberry-signature" },
  { name: "Lavanya Enclave",        slug: "lavanya-enclave" },
  { name: "Vikas Vihar",            slug: "vikas-vihar" },
];

const SERVICES = [
  "Buy Property",
  "Schedule Site Visit",
  "Home Loan Advisory",
  "Investment Consulting",
  "RERA Compliance",
];

export function Footer() {
  return (
    <footer className="bg-[#070F18] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-[#C9A96E] rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#0B1521]" />
              </div>
              <span className="font-serif text-xl font-semibold text-white">
                Homes<span className="text-[#C9A96E]">.</span>
              </span>
            </Link>
            <p className="text-sm text-[#5A7080] leading-relaxed mb-6 max-w-xs">
              Premium real estate advisory connecting buyers with RERA-verified properties across Lucknow and Uttar Pradesh.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <a href="tel:+918874625303" className="flex items-center gap-2.5 text-sm text-[#5A7080] hover:text-[#C9A96E] transition-colors">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" /> +91 88746 25303
              </a>
              <a href="mailto:info@homes.in" className="flex items-center gap-2.5 text-sm text-[#5A7080] hover:text-[#C9A96E] transition-colors">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" /> info@homes.in
              </a>
              <div className="flex items-start gap-2.5 text-sm text-[#5A7080]">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Royal Plaza, Sushant Golf City,<br />Sultanpur Road, Lucknow – 226030</span>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium mb-5">
              Projects
            </h3>
            <ul className="space-y-3">
              {PROJECTS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="text-sm text-[#5A7080] hover:text-white transition-colors"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium mb-5">
              Services
            </h3>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s}>
                  <span className="text-sm text-[#5A7080] hover:text-white transition-colors cursor-pointer">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Compliance */}
          <div>
            <h3 className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium mb-5">
              Company
            </h3>
            <ul className="space-y-3 mb-8">
              {["About Us", "Our Team", "Blogs & Insights", "Contact Us"].map((item) => (
                <li key={item}>
                  <Link href={item === "About Us" ? "/about" : item === "Contact Us" ? "/contact" : item === "Blogs & Insights" ? "/blogs" : "/"} className="text-sm text-[#5A7080] hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium mb-4">
              Compliance
            </h3>
            <ul className="space-y-2">
              {["UP-RERA Registered", "GST Compliant", "LDA Approved Projects", "SBI Approved"].map((c) => (
                <li key={c} className="flex items-center gap-2 text-xs text-[#3A5060]">
                  <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#2A3E52]">
            © {new Date().getFullYear()} Homes. All rights reserved. A premium real estate advisory platform.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "RERA Disclaimer"].map((link) => (
              <Link key={link} href="#" className="text-xs text-[#2A3E52] hover:text-[#5A7080] transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
