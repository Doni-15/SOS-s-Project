import { UserRound } from "lucide-react";

import { authAssets, loginContent } from "../constants/authContent";

export function AuthHeader() {
  return (
    <header className="text-center">
      <div className="relative mx-auto h-[92px] w-[190px] sm:h-[100px] sm:w-[210px] lg:h-[104px] lg:w-[230px]">
        <img
          src={authAssets.logo}
          alt="Kedai Nusantara"
          className="absolute left-1/2 top-1/2 h-[165px] w-[165px] -translate-x-1/2 -translate-y-[48%] object-contain sm:h-[180px] sm:w-[180px] lg:h-[198px] lg:w-[198px]"
        />
      </div>

      <h1 className="mx-auto -mt-1 whitespace-pre-line text-[1.45rem] font-semibold leading-snug tracking-[-0.01em] text-slate-600 sm:text-2xl">
        {loginContent.subtitle}
      </h1>

      <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700 shadow-sm">
        <UserRound className="h-5 w-5" />
        {loginContent.accessLabel}
      </div>
    </header>
  );
}
