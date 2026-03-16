type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AdminPageShell({ title, subtitle, children }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mb-6">
            {title ? (
              <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
                {title}
              </h1>
            ) : null}

            {subtitle ? (
              <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
            ) : null}
          </div>
        )}

        {children}
      </div>
    </main>
  );
}