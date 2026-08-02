import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { ProfileExperience } from "@/components/profile/profile-experience";
import { getProfileData } from "@/lib/profile/get-profile-data";

const profileSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-profile-sans",
  display: "swap",
});

const profileMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-profile-mono",
  display: "swap",
});

export const metadata = {
  title: "Profile preview (dev)",
  robots: { index: false, follow: false },
};

/** Local visual reference for SVG alignment — not a public surface. */
export default async function DevGitHubProfilePreviewPage() {
  const data = await getProfileData();

  return (
    <div
      className={`${profileSans.variable} ${profileMono.variable} min-h-screen bg-[rgb(10_12_18)]`}
    >
      <ProfileExperience data={data} />
    </div>
  );
}
