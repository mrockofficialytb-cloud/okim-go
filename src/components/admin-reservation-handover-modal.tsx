"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  open: boolean;
  mode: "pickup" | "return";
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    mileage: number;
    fuel: string;
    note: string;
    signatureOwner?: string;
    signatureCustomer?: string;
  }) => Promise<void> | void;
};

const fuelOptions = ["Prázdná", "1/4", "1/2", "3/4", "Plná"];

export default function AdminReservationHandoverModal({
  open,
  mode,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState("Plná");
  const [note, setNote] = useState("");

  const [ownerSigned, setOwnerSigned] = useState(false);
  const [customerSigned, setCustomerSigned] = useState(false);

  const [ownerSignature, setOwnerSignature] = useState<string | null>(null);
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);

  const ownerRef = useRef<SignatureCanvas | null>(null);
  const customerRef = useRef<SignatureCanvas | null>(null);

  const ownerWrapRef = useRef<HTMLDivElement | null>(null);
  const customerWrapRef = useRef<HTMLDivElement | null>(null);

  const [ownerCanvasWidth, setOwnerCanvasWidth] = useState(520);
  const [customerCanvasWidth, setCustomerCanvasWidth] = useState(520);

  const canvasHeight = 180;
  const isPickup = mode === "pickup";

  useEffect(() => {
    if (!open) {
      resetAll();
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !isPickup || (step !== 2 && step !== 3)) return;

    function updateCanvasSizes() {
      const ownerWidth = ownerWrapRef.current?.clientWidth ?? 520;
      const customerWidth = customerWrapRef.current?.clientWidth ?? 520;

      setOwnerCanvasWidth(Math.max(260, Math.floor(ownerWidth - 16)));
      setCustomerCanvasWidth(Math.max(260, Math.floor(customerWidth - 16)));
    }

    updateCanvasSizes();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSizes();
    });

    if (ownerWrapRef.current) resizeObserver.observe(ownerWrapRef.current);
    if (customerWrapRef.current) resizeObserver.observe(customerWrapRef.current);

    window.addEventListener("resize", updateCanvasSizes);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCanvasSizes);
    };
  }, [open, isPickup, step]);

  function resetAll() {
    setStep(1);
    setMileage("");
    setFuel("Plná");
    setNote("");
    setOwnerSigned(false);
    setCustomerSigned(false);
    setOwnerSignature(null);
    setCustomerSignature(null);
    ownerRef.current?.clear();
    customerRef.current?.clear();
  }

  function canContinueToSignature() {
    return mileage.trim().length > 0 && fuel.trim().length > 0;
  }

  function saveCustomerSignature() {
    const data = customerRef.current?.getTrimmedCanvas().toDataURL("image/png");
    setCustomerSigned(Boolean(data));
    setCustomerSignature(data || null);
  }

  function saveOwnerSignature() {
    const data = ownerRef.current?.getTrimmedCanvas().toDataURL("image/png");
    setOwnerSigned(Boolean(data));
    setOwnerSignature(data || null);
  }

  async function handleFinalSubmit() {
    if (!mileage) return;

    if (!customerSignature || !ownerSignature) {
      alert("Před potvrzením předání musí být oba podpisy vyplněny.");
      return;
    }

    await onSubmit({
      mileage: Number(mileage),
      fuel,
      note,
      signatureOwner: ownerSignature,
      signatureCustomer: customerSignature,
    });

    resetAll();
  }

  async function handleReturnSubmit() {
    if (!mileage) return;

    await onSubmit({
      mileage: Number(mileage),
      fuel,
      note,
    });

    resetAll();
  }

  function renderStepIndicator() {
    if (!isPickup) return null;

    const items = [
      { id: 1, label: "Údaje" },
      { id: 2, label: "Podpis zákazníka" },
      { id: 3, label: "Podpis pronajímatele" },
    ] as const;

    return (
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {items.map((item) => {
          const active = step === item.id;
          const done = step > item.id;

          return (
            <div key={item.id} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  active
                    ? "bg-neutral-900 text-white"
                    : done
                    ? "bg-emerald-500 text-white"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {done ? "✓" : item.id}
              </div>
              <span
                className={`text-sm font-medium ${
                  active ? "text-neutral-900" : "text-neutral-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171717]/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="max-h-[90vh] overflow-y-auto p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-neutral-500">
                {isPickup ? "Předání vozidla" : "Vrácení vozidla"}
              </p>

              <h3 className="mt-1 text-2xl font-semibold text-neutral-900">
                {isPickup
                  ? step === 1
                    ? "Vyplnit údaje k předání"
                    : step === 2
                    ? "Podpis zákazníka"
                    : "Podpis pronajímatele"
                  : "Potvrdit vrácení"}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                resetAll();
                onClose();
              }}
              className="rounded-full border border-neutral-300 px-3 py-1 text-sm"
              disabled={loading}
            >
              Zavřít
            </button>
          </div>

          {renderStepIndicator()}

          {!isPickup && (
            <>
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Stav tachometru (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm"
                    placeholder="Např. 54231"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Stav paliva
                  </label>

                  <select
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm"
                  >
                    {fuelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Poznámka
                  </label>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm"
                    placeholder="Např. vráceno v pořádku, drobné znečištění, škrábanec na disku..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleReturnSubmit}
                  disabled={loading || !mileage}
                  className="h-12 flex-1 rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  {loading ? "Ukládám..." : "Potvrdit vrácení"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    onClose();
                  }}
                  disabled={loading}
                  className="h-12 rounded-2xl border border-neutral-300 px-5 text-sm font-medium"
                >
                  Zrušit
                </button>
              </div>
            </>
          )}

          {isPickup && step === 1 && (
            <>
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Stav tachometru (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm"
                    placeholder="Např. 54231"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Stav paliva
                  </label>

                  <select
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm"
                  >
                    {fuelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Poznámka
                  </label>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm"
                    placeholder="Např. bez poškození, čistý interiér, předáno s plnou nádrží..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading || !canContinueToSignature()}
                  className="h-12 flex-1 rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  Přejít k podpisu
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    onClose();
                  }}
                  disabled={loading}
                  className="h-12 rounded-2xl border border-neutral-300 px-5 text-sm font-medium"
                >
                  Zrušit
                </button>
              </div>
            </>
          )}

          {isPickup && step === 2 && (
            <>
              <div className="mb-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-neutral-500">Tachometr:</span>{" "}
                    <strong>{mileage} km</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500">Palivo:</span>{" "}
                    <strong>{fuel}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500">Poznámka:</span>{" "}
                    <strong>{note || "—"}</strong>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Podpis zákazníka</p>
                  <span
                    className={`text-xs font-medium ${
                      customerSigned ? "text-emerald-600" : "text-neutral-400"
                    }`}
                  >
                    {customerSigned ? "Podepsáno" : "Nepodepsáno"}
                  </span>
                </div>

                <div
                  ref={customerWrapRef}
                  className="rounded-2xl border border-neutral-300 bg-white p-2"
                >
                  <SignatureCanvas
                    ref={customerRef}
                    penColor="black"
                    onEnd={saveCustomerSignature}
                    canvasProps={{
                      width: customerCanvasWidth,
                      height: canvasHeight,
                      className:
                        "block h-[180px] w-full rounded-xl bg-white touch-none",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    customerRef.current?.clear();
                    setCustomerSigned(false);
                    setCustomerSignature(null);
                  }}
                  className="mt-2 text-sm text-neutral-500"
                >
                  Vymazat podpis
                </button>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="h-12 rounded-2xl border border-neutral-300 px-5 text-sm font-medium"
                >
                  Zpět
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={loading || !customerSigned || !customerSignature}
                  className="h-12 flex-1 rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  Pokračovat na podpis pronajímatele
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    onClose();
                  }}
                  disabled={loading}
                  className="h-12 rounded-2xl border border-neutral-300 px-5 text-sm font-medium"
                >
                  Zrušit
                </button>
              </div>
            </>
          )}

          {isPickup && step === 3 && (
            <>
              <div className="mb-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-neutral-500">Tachometr:</span>{" "}
                    <strong>{mileage} km</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500">Palivo:</span>{" "}
                    <strong>{fuel}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500">Poznámka:</span>{" "}
                    <strong>{note || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500">Podpis zákazníka:</span>{" "}
                    <strong>{customerSigned ? "Ano" : "Ne"}</strong>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Podpis pronajímatele</p>
                  <span
                    className={`text-xs font-medium ${
                      ownerSigned ? "text-emerald-600" : "text-neutral-400"
                    }`}
                  >
                    {ownerSigned ? "Podepsáno" : "Nepodepsáno"}
                  </span>
                </div>

                <div
                  ref={ownerWrapRef}
                  className="rounded-2xl border border-neutral-300 bg-white p-2"
                >
                  <SignatureCanvas
                    ref={ownerRef}
                    penColor="black"
                    onEnd={saveOwnerSignature}
                    canvasProps={{
                      width: ownerCanvasWidth,
                      height: canvasHeight,
                      className:
                        "block h-[180px] w-full rounded-xl bg-white touch-none",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    ownerRef.current?.clear();
                    setOwnerSigned(false);
                    setOwnerSignature(null);
                  }}
                  className="mt-2 text-sm text-neutral-500"
                >
                  Vymazat podpis
                </button>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="h-12 rounded-2xl border border-neutral-300 px-5 text-sm font-medium"
                >
                  Zpět
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={
                    loading ||
                    !customerSigned ||
                    !ownerSigned ||
                    !customerSignature ||
                    !ownerSignature
                  }
                  className="h-12 flex-1 rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  {loading ? "Ukládám..." : "Podepsat a potvrdit předání"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    onClose();
                  }}
                  disabled={loading}
                  className="h-12 rounded-2xl border border-neutral-300 px-5 text-sm font-medium"
                >
                  Zrušit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}