import { getPropertyById } from "@/lib/db/actions/property.actions";
import { PropertyForm } from "@/components/dashboard/properties/PropertyForm";
import { withRole } from "@/lib/auth/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Property" };

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await withRole(["super_admin", "admin"]);
  const { id } = await params;

  const res = await getPropertyById(id);
  if (!res.success || !res.data) notFound();

  return (
    <div className="py-2">
      <PropertyForm property={res.data} />
    </div>
  );
}
