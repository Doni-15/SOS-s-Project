import { AlertCircle } from "lucide-react";

import { cn } from "../utils/cn";

export function Alert({ message, className }) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

        <p className="min-w-0 flex-1 whitespace-normal break-words leading-5">
          {message}
        </p>
      </div>
    </div>
  );
}
