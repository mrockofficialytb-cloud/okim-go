type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function AdminCard({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6 ${className}`}
    >
      {children}
    </div>
  );
}