import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { defaultLocale, locales } from "@/types/locale";

const LOCALE_PREFIX = new RegExp(
  `^/(${locales.join("|")})(/|$)`,
  "i"
);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip locale logic for admin and auth callback routes
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/auth")) {
    const hasLocale = LOCALE_PREFIX.test(pathname);
    if (!hasLocale) {
      const url = req.nextUrl.clone();
      url.pathname =
        pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
