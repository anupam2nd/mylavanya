
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonCustomProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "glass"
    | "primary-gradient"
    | "primary-outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const ButtonCustom = React.forwardRef<HTMLButtonElement, ButtonCustomProps>(
  ({ className, children, variant = "default", size = "md", isLoading, disabled, ...props }, ref) => {
    const isDisabled = isLoading || disabled;
    
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm": variant === "default",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
            "backdrop-blur-md bg-white/20 border border-white/20 text-foreground hover:bg-white/30 shadow-sm": variant === "glass",
            "bg-gradient-to-r from-primary to-rose-400 text-white hover:from-primary/90 hover:to-rose-400/90 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all": variant === "primary-gradient",
            "border-2 border-primary text-primary hover:bg-primary/10 transition-colors": variant === "primary-outline",
            "h-10 px-6 py-2": size === "md",
            "h-9 px-4 text-sm": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{children}</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

ButtonCustom.displayName = "ButtonCustom";

export { ButtonCustom };
