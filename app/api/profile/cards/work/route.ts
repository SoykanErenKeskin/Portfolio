import { renderWorkCard } from "@/lib/profile/svg/work";
import { respondProfileSvg } from "@/lib/profile/svg/respond";

export async function GET() {
  return respondProfileSvg("work", renderWorkCard);
}
