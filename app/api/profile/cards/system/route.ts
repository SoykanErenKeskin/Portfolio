import { renderSystemCard } from "@/lib/profile/svg/system";
import { respondProfileSvg } from "@/lib/profile/svg/respond";

export async function GET() {
  return respondProfileSvg("system", renderSystemCard);
}
