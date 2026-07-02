import { Link } from "@tanstack/react-router";
import { Bus } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  to?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, to, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-9 w-9 text-lg",
    lg: "h-10 w-10 text-xl",
  };

  const content = (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "grid place-items-center rounded-lg gradient-hero text-primary-foreground",
          sizeClasses[size].split(" ")[0], // Extract only h-x w-x
          size === "sm" ? "h-8 w-8" : size === "md" ? "h-9 w-9" : "h-10 w-10",
        )}
      >
        <Bus className={cn(size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-5 w-5")} />
      </div>
      <span
        className={cn(
          "font-bold tracking-tight",
          size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-xl",
        )}
      >
        SafariGo
      </span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className={cn("flex items-center gap-2", className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn("flex items-center gap-2", className)}>{content}</div>;
}
