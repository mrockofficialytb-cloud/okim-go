"use client";

import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess("");
    setError("");

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
        setError(data?.error ?? "Odeslání emailu se nepodařilo.");
        return;
      }

      setSuccess("Pokud účet existuje, poslali jsme vám email s odkazem na změnu hesla.");
    } catch {
      setError("Došlo k chybě při odesílání.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-3xl font-semibold tracking-tight">Zapomenuté heslo</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Zadejte email a pošleme vám odkaz na nastavení nového hesla.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Odesílám..." : "Odeslat odkaz"}
          </button>
        </form>
      </div>
    </main>
  );
}