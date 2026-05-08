import { cn } from "@/lib/ui";

export function ActionButton({
  children,
  onClick,
  variant = "default",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "nexus-btn-primary border-transparent text-white",
        variant === "danger" && "border-rose-400/40 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20",
        variant === "default" && "border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800",
      )}
    >
      {children}
    </button>
  );
}
