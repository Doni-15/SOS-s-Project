import { authAssets, authBrandContent } from "../constants/authContent";

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#003f9e_0%,#005bd8_58%,#0677f8_100%)] px-12 py-12 text-white lg:block xl:px-14">
      <div className="relative z-10">
        <h1 className="whitespace-pre-line text-[2rem] font-extrabold leading-[1.18] tracking-wide xl:text-[2.2rem]">
          {authBrandContent.headline}
        </h1>

        <p className="mt-7 max-w-[360px] text-base leading-8 text-blue-50/95">
          {authBrandContent.description}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 px-8 pb-8">
        <img
          src={authAssets.ownerIllustration}
          alt="Ilustrasi dashboard operasional restoran"
          className="mx-auto w-full max-w-[500px] drop-shadow-2xl"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-blue-950/25 to-transparent" />
      <div className="pointer-events-none absolute -left-28 bottom-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl" />
    </aside>
  );
}
