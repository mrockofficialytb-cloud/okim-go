"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const phoneRegex = /^(?:\+420\s?)?(?:\d{3}\s?\d{3}\s?\d{3})$/;

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!firstName.trim()) return "Zadejte jméno.";
    if (!lastName.trim()) return "Zadejte příjmení.";
    if (!email.trim()) return "Zadejte email.";
    if (!phone.trim()) return "Zadejte telefonní číslo.";
    if (!phoneRegex.test(phone.trim())) {
      return "Zadejte platné telefonní číslo.";
    }
    if (password.length < 8) return "Heslo musí mít alespoň 8 znaků.";
    if (password !== passwordConfirm) return "Hesla se neshodují.";
    if (!privacyConsent) return "Musíte souhlasit se zpracováním osobních údajů.";
    if (!termsConsent) return "Musíte souhlasit s obchodními podmínkami.";
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
  setLoading(true);

  const res = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      phone,
      password,
      passwordConfirm,
      privacyConsent,
      termsConsent,
      marketingConsent,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data?.error ?? "Registrace se nepodařila.");
    return;
  }

  router.push(`/overeni-emailu?email=${encodeURIComponent(email)}`);
  router.refresh();

} catch {
  setError("Došlo k chybě při registraci.");
} finally {
  setLoading(false);
}
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-3xl font-semibold tracking-tight">Registrace</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Vytvořte si účet pro rezervace a správu objednávek.
        </p>
        <p className="mt-2 text-sm font-medium text-neutral-800">
          Pole označená * jsou povinná.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Jméno *
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Příjmení *
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Telefonní číslo *
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+420 123 456 789"
              className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Heslo *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Potvrzení hesla *
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <label className="flex items-start gap-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>Souhlasím se zpracováním osobních údajů *</span>
            </label>

            <label className="flex items-start gap-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={termsConsent}
                onChange={(e) => setTermsConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>Souhlasím s obchodními podmínkami a podmínkami pronájmu *</span>
            </label>

            <label className="flex items-start gap-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>Chci dostávat nabídky a novinky</span>
            </label>
          </div>

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
            {loading ? "Vytvářím účet..." : "Registrovat se"}
          </button>
        </form>
      </div>
    </main>
  );
}