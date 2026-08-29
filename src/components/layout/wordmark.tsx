import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-block font-semibold tracking-tight",
        size === "sm" && "text-lg",
        size === "md" && "text-xl",
        size === "lg" && "text-3xl",
        className,
      )}
    >
      Caja<span className="text-brand">Libre</span>
    </span>
  );
}
