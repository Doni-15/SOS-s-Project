import { cn } from "../utils/cn";

export function TextField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  rightElement,
  autoComplete,
  error,
  required = false,
  disabled = false,
}) {
  return (
    <div className="w-full min-w-0 space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-950">
        {label}
      </label>

      <div
        className={cn(
          "flex min-h-[54px] w-full min-w-0 items-center rounded-lg border bg-white px-4 transition duration-200 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100",
          error ? "border-red-400" : "border-slate-300",
          disabled && "bg-slate-50 opacity-70",
        )}
      >
        {Icon ? (
          <Icon className="mr-3 h-5 w-5 shrink-0 text-slate-500" />
        ) : null}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className="h-12 min-w-0 flex-1 border-0 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />

        {rightElement ? <div className="ml-3 shrink-0">{rightElement}</div> : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
