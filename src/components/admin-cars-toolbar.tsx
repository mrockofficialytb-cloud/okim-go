import Link from "next/link";
import AdminNav from "@/components/admin-nav";

export default function AdminCarsToolbar() {
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="w-full lg:w-auto">
          <AdminNav current="cars" />
        </div>

        <div className="w-full lg:flex-1">
          <div className="flex justify-start lg:justify-end">
            <Link
              href="/admin/cars/new"
              aria-label="Přidat vozidlo"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-sm transition hover:bg-neutral-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}