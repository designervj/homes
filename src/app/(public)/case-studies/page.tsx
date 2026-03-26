import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { getPublishedCaseStudies } from "@/lib/db/actions/case-study.actions";
import { getPublishedCompanies } from "@/lib/db/actions/company.actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies — Homes",
  description:
    "See how Homes supports builders, listings, and conversion-focused campaigns across Lucknow real estate.",
};

export default async function CaseStudiesPage() {
  const [caseStudiesRes, companiesRes] = await Promise.all([
    getPublishedCaseStudies(),
    getPublishedCompanies(),
  ]);
  const caseStudies = caseStudiesRes.data ?? [];
  const companies = new Map(
    (companiesRes.data ?? []).map((company) => [company._id, company.name])
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-7 bg-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Case Studies
            </span>
          </div>
          <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            Conversion-Focused Proof from the Homes Platform
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            These stories connect companies, listed properties, and measurable
            outcomes across advisory, lead capture, and launch positioning.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {caseStudies.map((caseStudy) => (
            <Link
              key={caseStudy._id}
              href={`/case-studies/${caseStudy.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25"
            >
              <div className="mb-5 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-primary">
                {companies.get(caseStudy.companyId) ?? "Homes Partner"}
              </div>
              <h2 className="font-serif text-2xl font-medium text-foreground transition-colors group-hover:text-primary">
                {caseStudy.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {caseStudy.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {caseStudy.outcomes.slice(0, 3).map((outcome) => (
                  <span
                    key={`${outcome.label}-${outcome.value}`}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                  >
                    {outcome.label}: {outcome.value}
                  </span>
                ))}
              </div>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:text-primary-light">
                Read the full story <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        {caseStudies.length === 0 && (
          <div className="rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-base font-medium text-foreground">
              Case studies are being prepared
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Featured proof pages will appear here once published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
