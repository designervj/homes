"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, CheckCircle, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { submitEnquiry } from "@/lib/db/actions/enquiry.actions";
import { cn } from "@/lib/utils";

// ─── SCHEMA ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name:      z.string().min(2, "Name must be at least 2 characters"),
  phone:     z.string().min(7, "Enter a valid phone number").regex(/^[+]?[\d\s\-()]+$/, "Invalid phone number"),
  email:     z.string().email("Invalid email").optional().or(z.literal("")),
  message:   z.string().max(1000).optional(),
  siteVisit: z.boolean().optional(),
  homeLoan:  z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface EnquiryFormProps {
  propertyId?: string;
  propertyName?: string;
  propertySlug?: string;
  variant?: "sidebar" | "inline" | "modal";
  className?: string;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function EnquiryForm({
  propertyId,
  propertyName,
  propertySlug,
  variant = "sidebar",
  className,
}: EnquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const interestedIn: string[] = [];
      if (data.siteVisit) interestedIn.push("site_visit");
      if (data.homeLoan)  interestedIn.push("home_loan");
      if (interestedIn.length === 0) interestedIn.push("general");

      const res = await submitEnquiry({
        name:         data.name,
        phone:        data.phone,
        email:        data.email || undefined,
        message:      data.message || undefined,
        propertyId,
        propertyName,
        propertySlug,
        interestedIn: interestedIn as never,
        source:       "website",
      });

      if (res.success) {
        setSubmitted(true);
        reset();
        toast.success(res.message ?? "Enquiry submitted!");
      } else {
        toast.error(res.error ?? "Something went wrong. Please try again.");
      }
    });
  };

  // Input base styles
  const inputCls = cn(
    "w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3.5 py-2.5",
    "text-sm text-white placeholder:text-[#3A5060]",
    "outline-none focus:border-[#C9A96E]/50 focus:bg-[#C9A96E]/[0.03]",
    "transition-all duration-150"
  );

  if (submitted) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center gap-4", className)}>
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <p className="text-base font-medium text-white mb-1">Enquiry Received!</p>
          <p className="text-sm text-[#5A7080]">We&apos;ll reach out within 2–4 hours on business days.</p>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm text-[#C9A96E] hover:text-[#E2C99A] transition-colors mt-2"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-3.5", className)}>

      {/* Name */}
      <div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3A5060]" />
          <input
            {...register("name")}
            placeholder="Full Name *"
            className={cn(inputCls, "pl-9")}
          />
        </div>
        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3A5060]" />
          <input
            {...register("phone")}
            type="tel"
            placeholder="Phone / WhatsApp *"
            className={cn(inputCls, "pl-9")}
          />
        </div>
        {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
      </div>

      {/* Email */}
      <div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3A5060]" />
          <input
            {...register("email")}
            type="email"
            placeholder="Email Address (optional)"
            className={cn(inputCls, "pl-9")}
          />
        </div>
      </div>

      {/* Message — only for non-sidebar variants */}
      {variant !== "sidebar" && (
        <textarea
          {...register("message")}
          rows={3}
          placeholder="Your message or requirements…"
          className={cn(inputCls, "resize-none")}
        />
      )}

      {/* Checkboxes */}
      <div className="flex flex-col gap-2.5 py-1">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            {...register("siteVisit")}
            type="checkbox"
            className="w-4 h-4 rounded border-white/20 bg-white/[0.04] accent-[#C9A96E] cursor-pointer"
          />
          <span className="text-sm text-[#8A9BAE] group-hover:text-white transition-colors">
            I&apos;d like to schedule a site visit
          </span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            {...register("homeLoan")}
            type="checkbox"
            className="w-4 h-4 rounded border-white/20 bg-white/[0.04] accent-[#C9A96E] cursor-pointer"
          />
          <span className="text-sm text-[#8A9BAE] group-hover:text-white transition-colors">
            I need home loan assistance
          </span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm",
          "bg-[#C9A96E] hover:bg-[#E2C99A] text-[#0B1521]",
          "disabled:opacity-60 transition-colors"
        )}
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
        ) : (
          <><Send className="w-4 h-4" /> Send Enquiry</>
        )}
      </button>

      <p className="text-center text-xs text-[#3A5060]">
        We respond within 2–4 hours · No spam, ever.
      </p>
    </form>
  );
}
