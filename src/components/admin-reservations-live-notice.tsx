"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type LatestReservationResponse = {
  latestId: string | null;
  createdAt: string | null;
  customerName: string | null;
  carName: string | null;
};

export default function AdminReservationsLiveNotice() {
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [latestId, setLatestId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const initialIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkLatest() {
      try {
        const res = await fetch("/api/admin/reservations/latest", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data: LatestReservationResponse = await res.json();

        if (cancelled) return;

        if (!initializedRef.current) {
          initialIdRef.current = data.latestId;
          initializedRef.current = true;
          return;
        }

        if (data.latestId && data.latestId !== initialIdRef.current) {
          initialIdRef.current = data.latestId;
          setLatestId(data.latestId);

          const text =
            data.customerName && data.carName
              ? `Nová rezervace: ${data.customerName} – ${data.carName}`
              : "Nová rezervace přijata.";

          setMessage(text);
          setVisible(true);

          router.refresh();

          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
          }

          hideTimeoutRef.current = setTimeout(() => {
            setVisible(false);
          }, 7000);
        }
      } catch {
        // bez hlášky
      }
    }

    checkLatest();
    const interval = setInterval(checkLatest, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [router, pathname]);

  if (!visible || !latestId) return null;

  return (
    <div className="fixed right-5 top-24 z-[200] w-full max-w-sm">
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl ring-1 ring-black/5">
        <div className="bg-emerald-50 px-4 py-3">
          <div className="text-sm font-semibold text-emerald-800">
            Nová rezervace přijata
          </div>
        </div>

        <div className="px-4 py-4">
          <p className="text-sm text-neutral-700">{message}</p>

          <div className="mt-4 flex items-center gap-3">
            <Link
              href={`/admin/reservations/${latestId}`}
              onClick={() => setVisible(false)}
              className="inline-flex h-10 items-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Otevřít detail
            </Link>

            <button
              type="button"
              onClick={() => setVisible(false)}
              className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}