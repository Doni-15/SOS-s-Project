import { ArrowLeft } from "lucide-react";

import { cn } from "../utils/cn";

export function BackLink({
  children,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </button>
  );
}
