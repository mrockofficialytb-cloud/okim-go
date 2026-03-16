"use client";

import { useState } from "react";
import AdminCreateCarForm from "@/components/admin-create-car-form";

export default function AdminCreateCarPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-2xl font-medium text-white shadow-sm transition hover:bg-neutral-800"
          aria-label={open ? "Zavřít formulář nového modelu" : "Přidat nový model"}
          title={open ? "Zavřít" : "Přidat nový model"}
        >
          {open ? "−" : "+"}
        </button>
      </div>

      {open && (
        <div className="mt-4">
          <AdminCreateCarForm />
        </div>
      )}
    </div>
  );
}