import { ThemeProvider } from "@/components/theme/theme-provider";

const DOTS = [
  { t: 7, l: 12, a: 1 },
  { t: 23, l: 88, a: 2 },
  { t: 41, l: 5, a: 3 },
  { t: 67, l: 94, a: 4 },
  { t: 15, l: 45, a: 5 },
  { t: 82, l: 28, a: 6 },
  { t: 33, l: 72, a: 1 },
  { t: 55, l: 18, a: 2 },
  { t: 9, l: 76, a: 3 },
  { t: 91, l: 52, a: 4 },
  { t: 18, l: 3, a: 5 },
  { t: 74, l: 81, a: 6 },
  { t: 47, l: 61, a: 1 },
  { t: 3, l: 34, a: 2 },
  { t: 62, l: 9, a: 3 },
  { t: 28, l: 95, a: 4 },
  { t: 86, l: 67, a: 5 },
  { t: 11, l: 58, a: 6 },
  { t: 52, l: 42, a: 1 },
  { t: 38, l: 14, a: 2 },
  { t: 95, l: 23, a: 3 },
  { t: 21, l: 89, a: 4 },
  { t: 59, l: 77, a: 5 },
  { t: 44, l: 31, a: 6 },
  { t: 77, l: 55, a: 1 },
  { t: 6, l: 21, a: 2 },
  { t: 34, l: 48, a: 3 },
  { t: 69, l: 91, a: 4 },
  { t: 14, l: 64, a: 5 },
  { t: 88, l: 39, a: 6 },
  { t: 51, l: 8, a: 1 },
  { t: 26, l: 26, a: 2 },
  { t: 73, l: 63, a: 3 },
  { t: 2, l: 97, a: 4 },
  { t: 96, l: 84, a: 5 },
  { t: 37, l: 53, a: 6 },
  { t: 4, l: 67, a: 1 },
  { t: 19, l: 41, a: 2 },
  { t: 71, l: 15, a: 3 },
  { t: 56, l: 93, a: 4 },
  { t: 92, l: 71, a: 5 },
  { t: 31, l: 7, a: 6 },
  { t: 78, l: 46, a: 1 },
  { t: 12, l: 19, a: 2 },
  { t: 63, l: 84, a: 3 },
  { t: 45, l: 27, a: 4 },
  { t: 8, l: 52, a: 5 },
  { t: 84, l: 11, a: 6 },
  { t: 27, l: 78, a: 1 },
  { t: 99, l: 36, a: 2 },
  { t: 53, l: 59, a: 3 },
  { t: 16, l: 91, a: 4 },
  { t: 61, l: 4, a: 5 },
  { t: 39, l: 69, a: 6 },
  { t: 89, l: 82, a: 1 },
  { t: 24, l: 16, a: 2 },
  { t: 72, l: 38, a: 3 },
  { t: 5, l: 83, a: 4 },
  { t: 48, l: 49, a: 5 },
  { t: 93, l: 96, a: 6 },
  { t: 35, l: 31, a: 1 },
  { t: 68, l: 72, a: 2 },
  { t: 11, l: 9, a: 3 },
  { t: 81, l: 57, a: 4 },
  { t: 42, l: 88, a: 5 },
  { t: 17, l: 62, a: 6 },
  { t: 76, l: 24, a: 1 },
  { t: 58, l: 41, a: 2 },
  { t: 29, l: 54, a: 3 },
  { t: 97, l: 13, a: 4 },
  { t: 64, l: 66, a: 5 },
  { t: 22, l: 39, a: 6 },
];

function dotOpacity(t: number, l: number): number {
  const distToEdge = Math.min(t, 100 - t, l, 100 - l);
  const factor = Math.min(1, distToEdge / 35);
  return 0.28 * (0.35 + 0.65 * factor);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="admin-vibrant relative min-h-screen text-ink antialiased selection:bg-admin-violet/30">
        {/* Decorative background – wandering dots + grid */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-surface">
          {DOTS.map((dot, i) => (
            <div
              key={i}
              className={`admin-dot-wander admin-dot-a${dot.a}`}
              style={{
                top: `${dot.t}%`,
                left: `${dot.l}%`,
                backgroundColor: `rgb(139 92 246 / ${dotOpacity(dot.t, dot.l)})`,
                width: 4 + (i % 3),
                height: 4 + (i % 3),
              }}
            />
          ))}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 0h1v40H0V0zm1 0h1v40H1V0z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        {children}
      </div>
    </ThemeProvider>
  );
}
