import { renderHeroCard } from "@/lib/profile/svg/hero";
import { respondProfileSvg } from "@/lib/profile/svg/respond";

export async function GET() {
  return respondProfileSvg("hero", renderHeroCard);
}
