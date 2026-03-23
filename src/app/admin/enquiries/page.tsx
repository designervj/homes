import { getEnquiries, getEnquiryStats } from "@/lib/db/actions/enquiry.actions";
import { EnquiryInbox } from "@/components/dashboard/enquiries/EnquiryInbox";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "new";
  const page = Number(params.page) || 1;

  const [enquiriesRes, statsRes] = await Promise.all([
    getEnquiries({ status: status === "all" ? undefined : status, page, limit: 20 }),
    getEnquiryStats(),
  ]);

  return (
    <EnquiryInbox
      enquiries={enquiriesRes.data ?? []}
      pagination={enquiriesRes.pagination}
      stats={statsRes.data}
      currentStatus={status}
    />
  );
}
