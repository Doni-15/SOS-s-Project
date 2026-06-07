import { LoaderCircle } from "lucide-react";

import { cn } from "../utils/cn";

export function Button({
  type = "button",
  children,
  className,
  isLoading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-4 text-base font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)] transition duration-200 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:bg-blue-300 disabled:shadow-none",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="h-5 w-5 animate-spin" />
          <span>Memproses...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
