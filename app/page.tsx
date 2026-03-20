import { redirect } from "next/navigation";
import { defaultLocale } from "@/types/locale";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
