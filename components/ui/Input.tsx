import { InputHTMLAttributes, forwardRef } from "react";
import "./ui.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1" style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {label && (
          <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
            {label}
          </label>
        )}
        <input 
          ref={ref}
          className={`input-base ${className} ${error ? "border-red-500" : ""}`}
          {...props}
        />
        {error && (
          <span style={{ fontSize: "12px", color: "#f87171" }}>{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
