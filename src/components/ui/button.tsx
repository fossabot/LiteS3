import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-brand-indigo text-white hover:bg-accent-hover transition-colors",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors",
      outline: "border border-border-standard bg-transparent hover:bg-hover-bg text-text-primary transition-colors",
      secondary: "bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80 transition-colors",
      ghost: "bg-transparent hover:bg-hover-bg text-text-tertiary hover:text-text-primary transition-colors",
      link: "text-accent-violet underline-offset-4 hover:underline transition-colors",
    };
    const sizes: Record<string, string> = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-sm",
      lg: "h-11 rounded-lg px-8",
      icon: "h-9 w-9",
    };
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
