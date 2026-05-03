import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    
    const wrapperClasses = [
      "flex flex-col gap-1.5",
      fullWidth ? "w-full" : '',
      className
    ].filter(Boolean).join(' ');

    const inputClasses = [
      "flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors outline-none",
      "placeholder:text-foreground/50",
      "focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error ? "border-error focus-visible:border-error focus-visible:ring-error" : '',
      leftIcon ? "pl-10" : '',
      rightIcon ? "pr-10" : ''
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center text-foreground/50">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-foreground/50">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="m-0 text-xs font-medium text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
