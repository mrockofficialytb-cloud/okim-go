"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess("");
    setError("");
    setResendSuccess("");
    setResendError("");

    try {
      setLoading(true);

      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Ověření se nepodařilo.");
        return;
      }

      if (password) {
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
      }

      setSuccess("Email byl ověřen. Za chvíli budete přesměrováni.");

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch {
      setError("Došlo k chybě při ověření.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setResendSuccess("");
    setResendError("");
    setSuccess("");
    setError("");

    try {
      setResending(true);

      const res = await fetch("/api/resend-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResendError(data?.error ?? "Nový kód se nepodařilo odeslat.");
        return;
      }

      setResendSuccess("Nový ověřovací kód byl odeslán.");
    } catch {
      setResendError("Došlo k chybě při odesílání nového kódu.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-3xl font-semibold tracking-tight">Ověření emailu</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Na email <strong>{email}</strong> jsme poslali ověřovací kód.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Ověřovací kód
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-center text-lg tracking-[0.4em] outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Heslo pro automatické přihlášení
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {resendSuccess && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {resendSuccess}
            </div>
          )}

          {resendError && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {resendError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="h-12 w-full rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Ověřuji..." : "Ověřit email"}
          </button>

          <button
            type="button"
            onClick={resendCode}
            disabled={resending || !email}
            className="h-12 w-full rounded-2xl border border-neutral-300 bg-white text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-60"
          >
            {resending ? "Odesílám..." : "Poslat nový kód"}
          </button>
        </form>
      </div>
    </main>
  );
}