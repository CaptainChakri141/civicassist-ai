import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  ariaLabel,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner" aria-hidden="true"></span>
      ) : null}
      <span className={isLoading ? 'btn-text-hidden' : ''}>{children}</span>
    </button>
  );
};
