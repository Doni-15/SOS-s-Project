import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Data belum tersedia",
  description = "Belum ada data yang dapat ditampilkan.",
  action,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
        <Inbox className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-950">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
