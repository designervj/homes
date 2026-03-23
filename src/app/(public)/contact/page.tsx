import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Homes Real Estate Advisory",
  description: "Get in touch with our property experts. Schedule a site visit, get loan advisory, or enquire about any property.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#0B1521] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-7 h-px bg-[#C9A96E]" />
            <span className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium">Get In Touch</span>
            <div className="w-7 h-px bg-[#C9A96E]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-white mb-4">
            Talk to a Property Expert
          </h1>
          <p className="text-[#5A7080]">
            Our advisory team responds within 2–4 hours on business days. No pushy sales — just honest guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">

          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            {[
              { icon: Phone, label: "Call Us", value: "+91 88746 25303", href: "tel:+918874625303", sub: "Mon–Sat, 9 AM – 7 PM" },
              { icon: Mail,  label: "Email Us", value: "info@homes.in", href: "mailto:info@homes.in", sub: "We reply within 4 hours" },
              { icon: MapPin, label: "Our Office", value: "Royal Plaza, Sushant Golf City", href: null, sub: "Sultanpur Road, Lucknow – 226030" },
              { icon: Clock, label: "Working Hours", value: "Mon – Sat: 9 AM – 7 PM", href: null, sub: "Sunday by appointment" },
            ].map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex gap-4 p-4 bg-[#12202E] border border-white/[0.06] rounded-xl hover:border-[#C9A96E]/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#C9A96E]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#3A5060] uppercase tracking-wide mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-white">{item.value}</p>
                    <p className="text-xs text-[#5A7080] mt-0.5">{item.sub}</p>
                  </div>
                </div>
              );
              return item.href ? (
                <a key={item.label} href={item.href}>{content}</a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-[#12202E] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="font-serif text-xl font-medium text-white mb-6">Send an Enquiry</h2>
            <EnquiryForm variant="inline" />
          </div>
        </div>
      </div>
    </div>
  );
}
