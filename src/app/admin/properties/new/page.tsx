import { PropertyForm } from "@/components/dashboard/properties/PropertyForm";
import { withRole } from "@/lib/auth/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Property" };

export default async function NewPropertyPage() {
  await withRole(["super_admin", "admin"]);
  return (
    <div className="py-2">
      <PropertyForm />
    </div>
  );
}
