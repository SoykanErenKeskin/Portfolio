import { ValueBlock } from "@/components/home/value-block";
import { LatestPreviews } from "@/components/home/latest-previews";
import { SystemsMap } from "@/components/home/systems-map";
import { getMessages } from "@/lib/i18n";
import { getLatestProjects } from "@/lib/db/projects";
import { getLearningTimeline } from "@/lib/db/learning-timeline";
import { getCapabilityMap } from "@/lib/db/capability-map";
import { getGitHubContributions, parseGithubUsernameFromUrl } from "@/lib/github/contributions";
import { isLocale } from "@/types/locale";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const githubUser =
    process.env.GITHUB_USERNAME?.trim() || parseGithubUsernameFromUrl(messages.social.github);

  const [latest, learningTimeline, capabilityMap, githubData] = await Promise.all([
    getLatestProjects(3),
    getLearningTimeline(),
    getCapabilityMap(),
    getGitHubContributions(githubUser),
  ]);

  return (
    <>
      <ValueBlock messages={messages} />
      <SystemsMap
        messages={messages}
        learningTimeline={learningTimeline}
        capabilityMap={capabilityMap}
        locale={locale as "en" | "tr"}
        githubData={githubData}
        githubProfileUrl={messages.social.github}
      />
      <LatestPreviews
        locale={locale}
        messages={messages}
        projects={latest}
      />
    </>
  );
}
