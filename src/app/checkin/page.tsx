import { redirect } from "next/navigation";

export default function CheckinPage() {
  const today = new Date().toISOString().split("T")[0];
  redirect(`/daily/${today}`);
}
