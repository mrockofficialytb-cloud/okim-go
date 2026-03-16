"use client";

import { useState } from "react";
import AdminNav from "@/components/admin-nav";
import AdminCreateCarForm from "@/components/admin-create-car-form";

export default function AdminCarsToolbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="w-full lg:w-auto">
          <AdminNav current="cars" />
        </div>

        <div className="w-full lg:flex-1">
          <div className="flex justify-start lg:justify-end">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Zavřít formulář" : "Přidat vozidlo"}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#171717] text-white shadow-sm transition hover:bg-neutral-800"
            >
              <span className="text-2xl leading-none">{open ? "−" : "+"}</span>
            </button>
          </div>
        </div>
      </div>

      {open && <AdminCreateCarForm />}
    </div>
  );
}