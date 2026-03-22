import { ValueBlock } from "@/components/home/value-block";
import { LatestPreviews } from "@/components/home/latest-previews";
import { SystemsMap } from "@/components/home/systems-map";
import { getMessages } from "@/lib/i18n";
import { getLatestProjects } from "@/lib/db/projects";
import { getLearningTimeline } from "@/lib/db/learning-timeline";
import { getCapabilityMap } from "@/lib/db/capability-map";
import { isLocale } from "@/types/locale";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [messages, latest, learningTimeline, capabilityMap] = await Promise.all([
    getMessages(locale),
    getLatestProjects(3),
    getLearningTimeline(),
    getCapabilityMap(),
  ]);

  return (
    <>
      <ValueBlock messages={messages} />
      <SystemsMap
        messages={messages}
        learningTimeline={learningTimeline}
        capabilityMap={capabilityMap}
        locale={locale as "en" | "tr"}
      />
      <LatestPreviews
        locale={locale}
        messages={messages}
        projects={latest}
      />
    </>
  );
}
