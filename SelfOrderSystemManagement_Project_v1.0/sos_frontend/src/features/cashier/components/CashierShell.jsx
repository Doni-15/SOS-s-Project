import { DashboardShell } from "../../../shared/layouts/DashboardShell";

export function CashierShell({
  title,
  description,
  children,
  headerAction,
  badge = "Kasir",
}) {
  return (
    <DashboardShell
      badge={badge}
      title={title}
      description={description}
      headerAction={headerAction}
    >
      {children}
    </DashboardShell>
  );
}
