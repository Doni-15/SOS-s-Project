export function StatCard({ icon: Icon, label, value, helper, footer }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
            {value}
          </p>
          {helper ? <p className="mt-1 text-sm text-slate-500">{helper}</p> : null}
        </div>
      </div>

      {footer ? <div className="mt-4 text-sm">{footer}</div> : null}
    </article>
  );
}
