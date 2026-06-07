import { LoaderCircle } from "lucide-react";

export function PageLoader({ message = "Memeriksa sesi..." }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 text-sm font-semibold text-slate-700 shadow-sm">
        <LoaderCircle className="h-5 w-5 animate-spin text-blue-700" />
        <span>{message}</span>
      </section>
    </main>
  );
}
