import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", glass = true, children, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`${glass ? "glass-panel" : ""} ${className}`}
        style={{ padding: "24px" }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
