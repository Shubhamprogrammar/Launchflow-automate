import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 outline-none relative overflow-hidden select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer";
    
    const variantClasses = {
      primary: "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md",
      secondary: "bg-secondary text-white shadow-sm hover:bg-secondary-hover",
      outline: "bg-transparent text-foreground border border-border hover:bg-surface-hover hover:border-foreground",
      ghost: "bg-transparent text-foreground hover:bg-surface-hover",
      danger: "bg-error text-white hover:opacity-90"
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    };

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? "w-full" : "",
      isLoading ? "text-transparent" : "",
      className
    ].filter(Boolean).join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
        )}
        {!isLoading && leftIcon && <span className="flex items-center justify-center">{leftIcon}</span>}
        <span className="flex items-center">{children}</span>
        {!isLoading && rightIcon && <span className="flex items-center justify-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
