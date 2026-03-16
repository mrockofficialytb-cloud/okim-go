"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialValues: {
    firstName?: string | null;
    lastName?: string | null;
    dateOfBirth?: string | null;
    addressStreet?: string | null;
    addressCity?: string | null;
    addressZip?: string | null;
    idDocumentNumber?: string | null;
    driverLicenseNumber?: string | null;
    driverLicenseExpiry?: string | null;
  };
};

export default function AccountDetailsForm({ initialValues }: Props) {
  const router = useRouter();

  const [firstName, setFirstName] = useState(initialValues.firstName ?? "");
  const [lastName, setLastName] = useState(initialValues.lastName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initialValues.dateOfBirth ?? "");
  const [addressStreet, setAddressStreet] = useState(initialValues.addressStreet ?? "");
  const [addressCity, setAddressCity] = useState(initialValues.addressCity ?? "");
  const [addressZip, setAddressZip] = useState(initialValues.addressZip ?? "");
  const [idDocumentNumber, setIdDocumentNumber] = useState(initialValues.idDocumentNumber ?? "");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState(initialValues.driverLicenseNumber ?? "");
  const [driverLicenseExpiry, setDriverLicenseExpiry] = useState(
    initialValues.driverLicenseExpiry ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    try {
      setLoading(true);
      setSuccess("");
      setError("");

      const res = await fetch("/api/account/details", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          dateOfBirth,
          addressStreet,
          addressCity,
          addressZip,
          idDocumentNumber,
          driverLicenseNumber,
          driverLicenseExpiry,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Uložení se nepodařilo.");
        return;
      }

      setSuccess("Údaje byly uloženy.");
      router.refresh();
    } catch {
      setError("Došlo k chybě při ukládání údajů.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="text-xl font-semibold text-neutral-900">Profil řidiče</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Tyto údaje jsou důležité pro zpracování rezervace a předání vozidla.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Jméno</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            placeholder="Např. Jan"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Příjmení</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            placeholder="Např. Novák"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Datum narození</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">PSČ</label>
          <input
            value={addressZip}
            onChange={(e) => setAddressZip(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            placeholder="412 01"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Adresa</label>
          <input
            value={addressStreet}
            onChange={(e) => setAddressStreet(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            placeholder="Ulice a číslo popisné"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Město</label>
          <input
            value={addressCity}
            onChange={(e) => setAddressCity(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            placeholder="Např. Lovosice"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Číslo OP / pasu</label>
          <input
            value={idDocumentNumber}
            onChange={(e) => setIdDocumentNumber(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            placeholder="Např. 123456789"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Číslo řidičského průkazu</label>
          <input
            value={driverLicenseNumber}
            onChange={(e) => setDriverLicenseNumber(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            placeholder="Např. CZ123456"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Platnost řidičského průkazu</label>
          <input
            type="date"
            value={driverLicenseExpiry}
            onChange={(e) => setDriverLicenseExpiry(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {(success || error) && (
        <div className="mt-4">
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
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="h-12 rounded-2xl bg-neutral-900 px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? "Ukládám..." : "Uložit údaje"}
        </button>
      </div>
    </div>
  );
}