"use client";

import { FormEvent, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      setLoading(true);

      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          passwordConfirm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Změna hesla se nepodařila.");
        return;
      }

      setSuccess("Heslo bylo změněno. Za chvíli budete přesměrováni na přihlášení.");
      setTimeout(() => {
        router.push("/prihlaseni");
      }, 1500);
    } catch {
      setError("Došlo k chybě při změně hesla.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-3xl font-semibold tracking-tight">Nové heslo</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Nastavte si nové heslo k účtu.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Nové heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Potvrzení hesla</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          {success && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="h-12 w-full rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Ukládám..." : "Změnit heslo"}
          </button>
        </form>
      </div>
    </main>
  );
}