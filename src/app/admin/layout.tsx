import AdminReservationsLiveNotice from "@/components/admin-reservations-live-notice";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminReservationsLiveNotice />
      {children}
    </>
  );
}