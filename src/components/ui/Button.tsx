import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "dashed";
type ButtonSize = "sm" | "md";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-stone-800 text-stone-50 hover:bg-stone-700 disabled:opacity-50",
  secondary:
    "border border-stone-200 text-stone-500 hover:bg-white disabled:opacity-50",
  danger:
    "border border-stone-200 text-red-400 hover:border-red-200 hover:bg-red-50 disabled:opacity-50",
  ghost:
    "text-stone-400 hover:text-stone-600 disabled:opacity-50",
  dashed:
    "border border-dashed border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600 disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2.5 text-sm font-medium",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`rounded-lg transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
