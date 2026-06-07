import { cn } from "../../../shared/utils/cn";
import { getRoleLabel } from "../utils/userHelpers";

const roleClassName = {
  OWNER: "bg-blue-50 text-blue-700 ring-blue-100",
  CASHIER: "bg-indigo-50 text-indigo-700 ring-indigo-100",
};

export function UserRoleBadge({ role }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg px-3 py-1 text-xs font-bold ring-1",
        roleClassName[role] ?? "bg-slate-100 text-slate-700 ring-slate-200",
      )}
    >
      {getRoleLabel(role)}
    </span>
  );
}

export function UserStatusBadge({ isActive }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg px-3 py-1 text-xs font-bold ring-1",
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-red-50 text-red-700 ring-red-100",
      )}
    >
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}
