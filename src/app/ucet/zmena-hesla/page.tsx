"use client";

import { FormEvent, useState } from "react";

export default function ChangePasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Nepodařilo se odeslat email.");
        return;
      }

      setSuccess("Na email byl odeslán odkaz pro změnu hesla.");
    } catch {
      setError("Došlo k chybě při odesílání emailu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-16">
      <div className="mx-auto max-w-lg">

        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-black/5">

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Změna hesla
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Pošleme vám bezpečný odkaz pro nastavení nového hesla.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email účtu"
              required
              className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm"
            />

            {success && (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {loading ? "Odesílám..." : "Odeslat odkaz"}
            </button>

          </form>

        </div>

      </div>
    </main>
  );
}