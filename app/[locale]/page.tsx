import { ValueBlock } from "@/components/home/value-block";
import { LatestPreviews } from "@/components/home/latest-previews";
import { SystemsMap } from "@/components/home/systems-map";
import { getMessages } from "@/lib/i18n";
import { getLatestProjects } from "@/lib/db/projects";
import { isLocale } from "@/types/locale";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  const latest = await getLatestProjects(3);

  return (
    <>
      <ValueBlock messages={messages} />
      <SystemsMap messages={messages} />
      <LatestPreviews
        locale={locale}
        messages={messages}
        projects={latest}
      />
    </>
  );
}
