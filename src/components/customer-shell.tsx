import { AppShell } from "@/components/app-shell";

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return <AppShell role="customer">{children}</AppShell>;
}
