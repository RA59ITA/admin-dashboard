"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none";
    
    // Inline CSS for the moment to keep it self-contained
    const variantStyles = {
      primary: "bg-[#00FF88] text-[#0a0f12] hover:bg-[#33ff9d] shadow-[0_0_15px_rgba(0,255,136,0.25)] hover:shadow-[0_0_25px_rgba(0,255,136,0.4)]",
      secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
      outline: "border border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88]/10",
      ghost: "text-slate-300 hover:text-white hover:bg-white/5",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    // Note: Since we are not using Tailwind, we will inject a small custom style tag or rely on manual classes.
    // For pure aesthetics via normal CSS Variables and standard classes, let's use style objects or specific CSS classes.
    // Given the constraints to avoid tailwind if possible but maintain premium UI, I will apply direct styles for standard buttons.

    return (
      <button 
        ref={ref} 
        className={`${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 500,
          borderRadius: "8px",
          transition: "all 0.2s",
          cursor: "pointer",
          ...(size === "md" ? { padding: "8px 16px", fontSize: "14px" } : {}),
          ...(size === "sm" ? { padding: "6px 12px", fontSize: "13px" } : {}),
          ...(size === "lg" ? { padding: "12px 24px", fontSize: "16px" } : {}),
          ...(variant === "primary" ? {
            backgroundColor: "var(--accent-base)",
            color: "var(--bg-main)",
            boxShadow: "0 0 15px var(--accent-glow)",
            border: "none"
          } : {}),
          ...(variant === "secondary" ? {
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          } : {}),
        }}
        onMouseOver={(e) => {
          if (variant === "primary") e.currentTarget.style.backgroundColor = "var(--accent-hover)";
        }}
        onMouseOut={(e) => {
          if (variant === "primary") e.currentTarget.style.backgroundColor = "var(--accent-base)";
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
