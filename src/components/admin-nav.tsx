import Link from "next/link";

type CurrentSection =
  | "dashboard"
  | "reservations"
  | "users"
  | "cars"
  | "calendar";

type Props = {
  current: CurrentSection;
};

const items: Array<{
  key: CurrentSection;
  label: string;
  href: string;
}> = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin",
  },
  {
    key: "reservations",
    label: "Rezervace",
    href: "/admin/reservations",
  },
  {
    key: "users",
    label: "Uživatelé",
    href: "/admin/users",
  },
  {
    key: "cars",
    label: "Vozidla",
    href: "/admin/cars",
  },
  {
    key: "calendar",
    label: "Kalendář",
    href: "/admin/calendar",
  },
];

export default function AdminNav({ current }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
      {items.map((item) => {
        const active = item.key === current;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={[
              "flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-medium transition",
              "sm:inline-flex sm:justify-start",
              active
                ? "border-black bg-[#171717] text-white"
                : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}