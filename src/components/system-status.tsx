export default function SystemStatus() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">

      <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
        Stav systému
      </h2>

      <div className="mt-6 space-y-3 text-sm text-neutral-700">

        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-medium">Systém v pořádku</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
          <span>DB připojení</span>
          <span className="text-emerald-600 font-medium">OK</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
          <span>API</span>
          <span className="text-emerald-600 font-medium">OK</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
          <span>Email systém</span>
          <span className="text-emerald-600 font-medium">OK</span>
        </div>

      </div>
    </div>
  );
}