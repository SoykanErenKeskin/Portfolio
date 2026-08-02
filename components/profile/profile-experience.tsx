import type { ProfileData } from "@/lib/profile/types";
import { ProfileHero } from "@/components/profile/profile-hero";
import { WhatIBuild } from "@/components/profile/what-i-build";
import { FeaturedProjects } from "@/components/profile/featured-projects";
import { ActivityConsole } from "@/components/profile/activity-console";
import { TechnologyMap } from "@/components/profile/technology-map";
import { ContactTerminal } from "@/components/profile/contact-terminal";

type Props = {
  data: ProfileData;
};

export function ProfileExperience({ data }: Props) {
  return (
    <div className="profile-experience min-h-[70vh]">
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6 sm:py-12 md:space-y-16 md:py-14">
        <ProfileHero identity={data.identity} eder={data.eder} />
        <WhatIBuild cards={data.whatIBuild} />
        <FeaturedProjects projects={data.projects} />
        <ActivityConsole groups={data.activity} />
        <TechnologyMap techMap={data.techMap} />
        <ContactTerminal contact={data.contact} />
      </div>
    </div>
  );
}
