import { BadgeCheck, Building2, Users2, Star, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Homes Real Estate Advisory",
  description:
    "Learn about Homes — a trusted real estate advisory firm serving buyers and investors across Lucknow and Uttar Pradesh since 2019.",
};

const TEAM = [
  {
    name: "Maneesh Kumar Rai",
    role: "Founder & Principal Advisor",
    initials: "MR",
    bio: "With over a decade of experience in Uttar Pradesh real estate, Maneesh has guided hundreds of families and investors to the right property. Director at Shalu Homes Pvt. Ltd. and ESOS Tech LLP.",
  },
  {
    name: "Senior Advisory Team",
    role: "Property Consultants",
    initials: "SA",
    bio: "Our advisory team specialises in residential plots, high-rise apartments, and villa developments across Lucknow's fastest-growing corridors.",
  },
];

const VALUES = [
  { title: "Full Transparency",   desc: "Pricing, RERA IDs, stamp duty estimates, and legal clearance status — every listing is fully documented." },
  { title: "Zero Commission Conflict", desc: "We earn only when the right property matches the right buyer. No pressure, no inflated listings." },
  { title: "RERA-First",          desc: "We list only RERA-registered projects or verified resale properties with clear title. Compliance is non-negotiable." },
  { title: "Buyer Advocacy",      desc: "We work for the buyer, not the builder. Every recommendation is made with your long-term interest in mind." },
];

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {/* Hero */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-px bg-primary" />
            <span className="text-xs text-primary uppercase tracking-widest font-medium">Our Story</span>
          </div>
            <h1 className="mb-6 font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-5xl">
              Guiding You <br className="hidden sm:block" />
              <span className="text-gradient-primary italic">Every Step</span> of the Way.
            </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Homes was built on a single premise — property buyers in Lucknow deserved better. Better information, better legal clarity, and an advisor who actually works for them.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users2,    num: "500+", label: "Families Served" },
            { icon: Building2, num: "7",    label: "Active Projects" },
            { icon: BadgeCheck,num: "100%", label: "RERA Verified" },
            { icon: Star,      num: "5★",   label: "Client Rating" },
          ].map(({ icon: Icon, num, label }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-6 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-3" />
              <p className="mb-1 font-serif text-3xl font-semibold text-foreground">{num}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-px bg-primary" />
              <span className="text-xs text-primary uppercase tracking-widest font-medium">Who We Are</span>
            </div>
            <h2 className="mb-6 font-serif text-3xl font-medium text-foreground">
              A Consultancy Built on Relationships, Not Commissions
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px]">
              <p>
                Homes operates as a strategic intermediary and brokerage — connecting prospective homebuyers and institutional investors with residential assets developed by trusted builders across Uttar Pradesh.
              </p>
              <p>
                We serve three fundamental needs: helping buyers find the right property, arranging site visits at their convenience, and providing fair, unbiased home loan guidance through partner banks.
              </p>
              <p>
                Our office is in Sushant Golf City, Lucknow — the heart of the city&apos;s most active residential corridors. Every property we list, we know personally.
              </p>
            </div>
            <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              Royal Plaza, Sushant Golf City, Sultanpur Road, Lucknow – 226030
            </div>
          </div>
          <div className="space-y-3">
            {VALUES.map((value) => (
              <div key={value.title} className="bg-card border border-border rounded-xl p-5">
                <p className="mb-2 text-sm font-medium text-foreground">{value.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-7 h-px bg-primary" />
            <span className="text-xs text-primary uppercase tracking-widest font-medium">Our Team</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-card border border-border rounded-2xl p-7">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-lg font-semibold text-primary">{member.initials}</span>
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-primary mt-0.5">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="bg-card border border-primary/15 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <BadgeCheck className="h-5 w-5 text-secondary" />
            <h2 className="font-serif text-xl font-medium text-foreground">Our Compliance Commitment</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["UP-RERA Registered", "GST Compliant", "LDA Approved Projects", "SBI / HDFC Approved"].map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
