import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ChatWidget } from "@/components/chat/chat-widget";
import { LocaleHtml } from "@/components/i18n/locale-html";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getMessages } from "@/lib/i18n";
import { locales, isLocale } from "@/types/locale";
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const m = getMessages(locale);
  return {
    title: m.meta.title,
    description: m.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [messages, session] = await Promise.all([
    getMessages(locale),
    auth(),
  ]);

  return (
    <ThemeProvider>
      <LocaleHtml locale={locale} />
      <div className="flex min-h-screen flex-col">
        <SiteHeader locale={locale} messages={messages} isAdmin={!!session?.user} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} messages={messages} />
        <ChatWidget messages={messages.chat} />
      </div>
    </ThemeProvider>
  );
}
