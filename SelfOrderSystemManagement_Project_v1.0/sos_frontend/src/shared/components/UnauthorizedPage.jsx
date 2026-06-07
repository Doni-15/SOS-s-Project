import { Link } from "react-router";

export function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-600">403</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Akses ditolak
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Role akun kamu tidak memiliki izin untuk membuka halaman ini.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Kembali ke Login
        </Link>
      </section>
    </main>
  );
}
