import { ShieldCheck } from "lucide-react";

import { loginContent } from "../constants/authContent";

export function AuthSecurityNote() {
  return (
    <div className="mt-7 border-t border-slate-200 pt-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <p className="text-sm leading-6 text-slate-600">
          {loginContent.securityNote}
        </p>
      </div>
    </div>
  );
}
