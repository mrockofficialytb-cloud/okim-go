export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELED";

export function getReservationStatusLabel(status: ReservationStatus) {
  if (status === "PENDING") return "Čeká";
  if (status === "CONFIRMED") return "Schváleno";
  if (status === "PICKED_UP") return "Půjčeno";
  if (status === "RETURNED") return "Dokončeno";
  return "Zrušeno";
}

export function getReservationStatusLongLabel(status: ReservationStatus) {
  if (status === "PENDING") return "Čeká na schválení";
  if (status === "CONFIRMED") return "Schváleno";
  if (status === "PICKED_UP") return "Půjčeno";
  if (status === "RETURNED") return "Dokončeno";
  return "Zrušeno";
}

export function getReservationStatusBadgeClass(status: ReservationStatus) {
  if (status === "PENDING") {
    return "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800";
  }

  if (status === "CONFIRMED") {
    return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800";
  }

  if (status === "PICKED_UP") {
    return "rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700";
  }

  if (status === "RETURNED") {
    return "rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-800";
  }

  return "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700";
}

export function getReservationStatusCardClass(status: ReservationStatus) {
  if (status === "PENDING") {
    return "bg-amber-100 text-amber-800";
  }

  if (status === "CONFIRMED") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "PICKED_UP") {
    return "bg-blue-100 text-blue-800";
  }

  if (status === "RETURNED") {
    return "bg-neutral-200 text-neutral-800";
  }

  return "bg-red-100 text-red-800";
}

export function getReservationStatusNote(status: ReservationStatus) {
  if (status === "RETURNED") {
    return {
      text: "✓ Rezervace dokončena",
      className: "text-sm font-medium text-emerald-600",
    };
  }

  if (status === "CANCELED") {
    return {
      text: "✕ Rezervace zrušena",
      className: "text-sm font-medium text-red-600",
    };
  }

  return null;
}