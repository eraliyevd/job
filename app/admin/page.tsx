import { redirect } from "next/navigation";

// Legacy /admin URL — redirect to 404 (panel is at /cp)
export default function LegacyAdminPage() {
  redirect("/");
}
