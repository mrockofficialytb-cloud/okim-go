import Link from "next/link";
import { auth } from "@/auth";
import UserMenu from "@/components/user-menu";
import Image from "next/image";

export default async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="relative z-40 bg-[#171717] px-4 py-4 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-okim.svg"
            alt="OKIM GO"
            width={160}
            height={36}
            priority
          />
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">
          {!user ? (
            <>
              <Link
                href="/prihlaseni"
                className="flex h-12 items-center rounded-2xl border border-white/15 bg-[#171717] px-4 text-sm font-medium text-white transition hover:border-white/25 sm:h-14 sm:px-5"
              >
                Přihlášení
              </Link>

              <Link
                href="/registrace"
                className="flex h-12 items-center rounded-2xl bg-white px-4 text-sm font-medium text-black transition hover:bg-neutral-100 sm:h-14 sm:px-5"
              >
                Registrace
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="flex h-12 items-center rounded-2xl border border-white/20 px-4 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 sm:h-14 sm:px-5"
              >
                Rezervace
              </Link>

              <UserMenu
                name={user.name || user.email || "Uživatel"}
                role={user.role}
              />

              {(user.role === "ADMIN" || user.role === "STAFF") && (
                <Link
                  href="/admin"
                  className="flex h-12 items-center gap-2 rounded-2xl border border-white/20 px-4 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 sm:h-14 sm:px-5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                  </svg>

                  Administrace
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}