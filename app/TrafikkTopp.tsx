"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car } from "lucide-react";

const LINKS = [
  { href: "/", label: "Telling" },
  { href: "/statistikk", label: "Statistikk" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function TrafikkTopp() {
  const pathname = usePathname();
  const onStats = pathname.startsWith("/statistikk");

  return (
    <header className="border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600" aria-hidden="true">
            <Car size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Trafikktelling</h1>
            <p className="text-xs text-slate-500">
              {onStats ? "Kart og statistikk" : "Registrer kjøretøy"}
            </p>
          </div>
        </div>

        <nav
          className="grid grid-cols-2 gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 sm:w-72"
          aria-label="Trafikktelling"
        >
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  "rounded-full px-3 py-2 text-center text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 " +
                  (active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-900")
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
