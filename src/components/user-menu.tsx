"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

type Props = {
  name: string;
  role?: "USER" | "STAFF" | "ADMIN";
};

export default function UserMenu({ name, role }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const getRoleLabel = () => {
    if (role === "ADMIN") return "Administrátor";
    if (role === "STAFF") return "Zaměstnanec";
    return "Uživatel";
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 items-center gap-3 rounded-2xl border border-white/15 bg-[#171717] px-4 text-left text-white transition hover:border-white/25"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold">
          {initials}
        </div>

        <div className="hidden sm:block">
          <div className="text-sm font-semibold leading-tight">{name}</div>

          <div className="flex items-center gap-2 text-sm leading-tight text-neutral-300">
            {(role === "ADMIN" || role === "STAFF") && (
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            )}
            {getRoleLabel()}
          </div>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`ml-1 h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 md:right-0 -right-6 md:-right-0 top-[calc(100%+10px)] z-50
          w-[min(52vw,280px)]
          overflow-hidden rounded-3xl border border-neutral-200 bg-white
          shadow-2xl"
        >
          <div
            className="border-b border-neutral-200 bg-neutral-50 px-4 py-3"
            style={{ color: "#6b7280" }}
          >
            <div
              className="text-sm font-semibold"
              style={{ color: "#374151" }}
            >
              {name}
            </div>

            <div
              className="text-xs font-medium"
              style={{ color: "#6b7280" }}
            >
              {getRoleLabel()}
            </div>
          </div>

          <div className="p-2">

            <Link
              href="/ucet"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Můj účet
            </Link>

            <Link
              href="/moje-rezervace"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Moje rezervace
            </Link>

            <Link
              href="/ucet/udaje"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Moje údaje
            </Link>

            <Link
              href="/ucet/zmena-hesla"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Změna hesla
            </Link>

            <div className="my-1 h-px bg-neutral-200" />

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Odhlásit se
            </button>

          </div>
        </div>
      )}
    </div>
  );
}