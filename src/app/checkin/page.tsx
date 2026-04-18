import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CheckinPage() {
  const today = new Date().toISOString().split("T")[0];
  redirect(`/daily/${today}`);
}
