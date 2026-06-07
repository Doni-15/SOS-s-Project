import { AuthBrandPanel } from "./AuthBrandPanel";

export function AuthShell({ children }) {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-5 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-8 lg:py-6">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl lg:min-h-[620px] lg:grid-cols-[0.95fr_1.05fr]">
        <AuthBrandPanel />

        <div className="flex min-h-[calc(100dvh-2.5rem)] items-center justify-center px-5 py-8 sm:px-8 lg:min-h-0 lg:px-12 xl:px-16">
          <div className="w-full max-w-[430px]">{children}</div>
        </div>
      </section>
    </main>
  );
}
